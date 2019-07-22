import * as stream from 'stream';
import { ReadableOptions } from 'stream';

export class SheetReadableStream extends stream.Readable {
  rows: any[];

  constructor(options?: ReadableOptions) {
    super(options); //Passing options to native class constructor. (REQUIRED)
    this.rows = [];
  }

  addRows(rows: any[]) {
    this.rows = rows;

  }

  _read(size: number): void {}
}
