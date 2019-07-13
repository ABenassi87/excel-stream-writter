import { Readable, Writable } from 'stream';

export function getCellAddress(rowIndex: number, colIndex: number): string {
  let colAddress: string = '';
  let input: string = (colIndex - 1).toString(26);
  while (input.length) {
    const a = input.charCodeAt(input.length - 1);
    colAddress = String.fromCharCode(a + (a >= 48 && a <= 57 ? 17 : -22)) + colAddress;
    input = input.length > 1 ? (parseInt(input.substr(0, input.length - 1), 26) - 1).toString(26) : '';
  }
  return colAddress + rowIndex;
}

export async function getXmlFromXmlStream(xmlStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const ws: Writable = new Writable();
    let xml: string = '';
    ws._write = function(chunk, enc, next) {
      xml += chunk.toString();
      next();
    };
    xmlStream.pipe(ws);
    ws.on('finish', () => {
      resolve(xml);
    });
    ws.on('error', err => {
      reject(err);
    });
  });
}

export function wrapRowsInStream(rows: any[]): Readable {
  const rs = new Readable({ objectMode: true });
  let c = 0;
  rs._read = function() {
    if (c === rows.length) rs.push(null);
    else rs.push(rows[c]);
    c++;
  };
  return rs;
}

export function escapeXml(str = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeXmlExtended(str = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const isNil = (val: any) => val === undefined || val === null;

export const is = (type: any, val: any) => ![, null].includes(val) && val.constructor === type;

export const isArrayLike = (obj: any) => obj != null && typeof obj[Symbol.iterator] === 'function';
