import * as jsforce from 'jsforce';
import { XlsxStreamWriter } from '../../src/xlsx-stream-writer';
import * as async from 'async';
import logger from './logger';

export interface JSForceConnOptions {
  loginUrl: string;
  username: string;
  password: string;
}

export function performBulkQuery(options: JSForceConnOptions, soql: string, xlsxWriter: XlsxStreamWriter): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const { loginUrl, username, password } = options;
      logger.info(`loginUrl: ${loginUrl}`);
      logger.info(`username: ${username}`);
      logger.info(`password: ${password}`);
      logger.info(`soql: ${soql}`);

      const conn: jsforce.Connection = new jsforce.Connection({ loginUrl });
      const userInfo: jsforce.UserInfo = await conn.login(username, password);

      let query: jsforce.QueryResult<any> = await conn.query(soql);

      logger.info(`query total: ${query.totalSize}`);
      logger.info(`query records size: ${query.records.length}`);

      let rows: any[] = transformQueryResults(query.records, true);

      xlsxWriter.addRows(rows);

      if (query.done) {
        resolve();
      } else {
        if (!!query.nextRecordsUrl) {
          const urls = generateURLs(query.nextRecordsUrl, query.records.length, query.totalSize);
          const q = async.queue((data: { url: string }, callback) => {
            logger.info(`Processing new data. URL: ${data.url}`);
            conn
              .queryMore(data.url)
              .then((queryResult: jsforce.QueryResult<any>) => {
                rows = transformQueryResults(queryResult.records);
                xlsxWriter.addRows(rows);
                callback();
              })
              .catch(err => {
                callback();
              });
          }, 3);

          // assign a callback
          q.drain(function() {
            logger.info('all items have been processed');
            resolve();
          });
          urls.forEach((url: string) => {
            q.push({ url });
          });
        } else {
          resolve();
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

function transformQueryResults(records: any[], includeHeader: boolean = false): any[] {
  const rows: any[] = [];

  if (Array.isArray(records)) {
    records.forEach((d: any) => {
      if (includeHeader) {
        const header = Object.keys(d);
        rows.push(header);
        includeHeader = false;
      }

      const row = Object.keys(d).map(key => d[key]);
      rows.push(row);
    });
  }

  return rows;
}

function generateURLs(nextUrl: string, recordsSize: number, totalSize: number): string[] {
  const urls: string[] = [];

  const prefix = nextUrl.substring(0, nextUrl.lastIndexOf('-'));
  let batch = recordsSize;
  while (batch + recordsSize < totalSize) {
    batch += recordsSize;
    urls.push(`${prefix}-${batch}`);
  }
  return urls;
}
