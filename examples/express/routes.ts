import { Request, Response, Router } from 'express';
import { generateRandomData } from './helper';
import { XlsxStreamWriter } from '../../src/xlsx-stream-writer';
import logger from './logger';
import * as async from 'async';

const applicationRoutes: Router = Router();

applicationRoutes.get('/download', generateFile);

function generateFile(req: Request, res: Response) {
  logger.info('generateFile');
  const rows = generateRandomData(50, true);
  logger.info('data generated', rows.length);
  const xlsxWriter = new XlsxStreamWriter();

  xlsxWriter.addRows(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'example.xlsx');
  let i = 0;

  const readable = xlsxWriter.getStream();
  readable
    .on('data', (data: Buffer) => {
      res.write(data, 'buffer');
    })
    .on('end', function() {
      logger.info('zip stream ended.');
    });
  readable.pipe(res);

  const q = async.queue((data: { rows: any[] }, callback) => {
    xlsxWriter.addRows(data.rows);
    callback();
  }, 3);

  // assign a callback
  q.drain(function() {
    console.log('all items have been processed');
    xlsxWriter.commit();
  });

  for (let j = 0; j < 10; j++) {
    const rowsData: any[] = generateRandomData(500);
    q.push({ rows: rowsData }, err => {
      logger.info('Added new data.');
    });
  }
}

export default applicationRoutes;
