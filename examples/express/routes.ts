import { Request, Response, Router } from 'express';
import { getData } from './helper';
import { XlsxStreamWriter } from '../../src/xlsx-stream-writer';
import logger from './logger';
import * as async from 'async';

const applicationRoutes: Router = Router();

applicationRoutes.get('/download', generateFile);

function generateFile(req: Request, res: Response) {
  logger.info('generateFile');
  getData(true).then((rows: any[]) => {
    logger.info('data generated', rows.length);
    const xlsxWriter = new XlsxStreamWriter();

    xlsxWriter.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'example.xlsx');

    const readable = xlsxWriter.getStream();

    populateData(xlsxWriter)
      .then(() => xlsxWriter.commit())
      .catch(err => logger.error(err));

    readable
      .on('end', function() {
        logger.info('zip stream ended.');
      })
      .pipe(res)
      .on('finish', function() {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        logger.info('zip finished.');
      });
  });
}

function populateData(xlsxWriter: XlsxStreamWriter): Promise<void> {
  return new Promise(resolve => {
    logger.info('populateData');
    const q = async.queue((data: { url: string }, callback) => {
      logger.info('Processing new data.');
      getData().then((rowsData: any[]) => {
        xlsxWriter.addRows(rowsData);
        callback();
      });
    }, 3);

    // assign a callback
    q.drain(function() {
      logger.info('all items have been processed');
      resolve();
    });

    for (let j = 0; j < 20; j++) {
      q.push({ url: 'test' }, err => {});
    }
  });
}

export default applicationRoutes;
