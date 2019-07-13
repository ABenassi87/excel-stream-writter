import { wrapRowsInStream } from '../src/helpers';
import { XlsxStreamWriter } from '../src/xlsx-stream-writer';
import * as fs from 'fs';

const rows = [['Name', 'Location'], ['Alpha', 'Adams'], ['Bravo', 'Boston'], ['Charlie', 'Chicago']];

const streamOfRows = wrapRowsInStream(rows);

const xlsx = new XlsxStreamWriter();
xlsx.addRows(streamOfRows);

xlsx.getFile().then(buffer => {
  fs.writeFileSync('result.xlsx', buffer);
});
