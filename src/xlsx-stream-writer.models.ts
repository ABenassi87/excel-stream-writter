import { ReadableStreamBufferOptions } from "stream-buffers";

export interface XlsxStreamWriterOptions {
  inlineStrings: boolean;
  styles: XLSXStyle[];
  styleIdFunc: (value: any, columnId: number, rowId: number) => number;
  zip?: ArchiverZipOptions;
  buffer?: ReadableStreamBufferOptions;
}

interface ArchiverZipOptions {
  comment: string;
  forceLocalTime: boolean;
  forceZip64: boolean;
  store: boolean;
  zlib: Partial<ZlibOptions>;
}

interface ZlibOptions {
  /**
   * @default constants.Z_NO_FLUSH
   */
  flush: number;
  /**
   * @default constants.Z_FINISH
   */
  finishFlush: number;
  /**
   * @default 16*1024
   */
  chunkSize: number;
  windowBits: number;
  level: number; // compression only
  memLevel: number; // compression only
  strategy: number; // compression only
  dictionary: Buffer | NodeJS.TypedArray | DataView | ArrayBuffer; // deflate/inflate only, empty dictionary by default
}

export interface XLSXStyle {
  fill?: string;
  format?: string;
}

export interface XLSX {
  [key: string]: string;
}

export interface SharedStringsMap {
  [key: string]: number;
}

export const UTF8_ENCODING = 'utf8';
