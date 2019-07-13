import * as fs from 'fs';
import { XlsxStreamWriter } from '../src/xlsx-stream-writer';

const rows = [['Name', 'Location'], ['Иван', 'Москва'], ['Alpha', 'Adams'], ['Bravo', 'Boston'], ['Charlie', 'Chicago']];

const xlsx = new XlsxStreamWriter();
xlsx.addRows(rows);

xlsx.getFile().then(buffer => {
  fs.writeFileSync('result.xlsx', buffer);
});
