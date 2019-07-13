import { SharedStringsMap, UTF8_ENCODING, XLSX, XlsxStreamWriterOptions } from './xlsx-stream-writer.models';
import * as xmlBlobs from './xml/blobs';
import * as xmlParts from './xml/parts';
import { sheetFooter, sheetHeader } from './xml/parts';
import { escapeXml, getCellAddress, is } from './helpers';
import { getStyles } from './styles';
import * as streamBuffers from 'stream-buffers';

const JSZip = require('jszip');

const defaultOptions: XlsxStreamWriterOptions = {
  inlineStrings: false,
  styles: [],
  styleIdFunc: (value: any, columnId: number, rowId: number) => 0,
  zip: {
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 1,
    },
    streamFiles: true,
  },
  buffer: {
    frequency: 10, // in milliseconds.
    chunkSize: 2048, // in bytes.
  },
};

export class XlsxStreamWriter {
  options: XlsxStreamWriterOptions;
  sheetXmlStream: streamBuffers.ReadableStreamBuffer;
  sharedStringsXmlStream: streamBuffers.ReadableStreamBuffer;
  sharedStringsArr: string[];
  sharedStringsMap: SharedStringsMap;
  sharedStringsHashMap: any;
  xlsx: XLSX;
  zip: any;
  currentRowIdx = 0;

  constructor(options?: Partial<XlsxStreamWriterOptions>) {
    this.options = Object.assign(defaultOptions, options);

    this.sheetXmlStream = new streamBuffers.ReadableStreamBuffer(this.options.buffer);
    this.sharedStringsXmlStream = new streamBuffers.ReadableStreamBuffer(this.options.buffer);
    this.sharedStringsArr = [];
    this.sharedStringsMap = {};
    this.sharedStringsHashMap = {};
    this.currentRowIdx = 0;

    this.zip = new JSZip();

    this.xlsx = {
      '[Content_Types].xml': cleanUpXml(xmlBlobs.contentTypes),
      '_rels/.rels': cleanUpXml(xmlBlobs.rels),
      'xl/workbook.xml': cleanUpXml(xmlBlobs.workbook),
      // "xl/styles.xml": cleanUpXml(xmlBlobs.styles),
      'xl/styles.xml': cleanUpXml(getStyles(this.options.styles)),
      'xl/_rels/workbook.xml.rels': cleanUpXml(xmlBlobs.workbookRels),
    };

    this._clearSharedStrings();

    Object.keys(this.xlsx).forEach(key => this.zip.file(key, this.xlsx[key]));
    // add "xl/worksheets/sheet1.xml"
    this.zip.file('xl/worksheets/sheet1.xml', this.sheetXmlStream);
    // add "xl/sharedStrings.xml"
    this.zip.file('xl/sharedStrings.xml', this.sharedStringsXmlStream);
    this._addSheetHeader();
  }

  _addSheetHeader() {
    this.sheetXmlStream.put(sheetHeader, UTF8_ENCODING);
  }

  _addRow(row: any, index: number) {
    const rowString = this._getRowXml(row, index);
    this.sheetXmlStream.put(rowString, UTF8_ENCODING);
  }

  _addSheetFooter() {
    this.sheetXmlStream.put(sheetFooter, UTF8_ENCODING);
    this.sheetXmlStream.stop();
  }

  /**
   * Add rows to xlsx.
   * @param {Array} rows array of arrays.
   * @return {undefined}
   */
  addRows(rows: any[]) {
    rows.forEach((row, index) => {
      const i = this.currentRowIdx + index;
      this._addRow(row, i);
    });
    this.currentRowIdx = this.currentRowIdx + rows.length;
  }

  _serializeSharedString() {
    this.sharedStringsXmlStream.put(xmlParts.getSharedStringsHeader(this.sharedStringsArr.length));
    for (let shared of this.sharedStringsArr) {
      this.sharedStringsXmlStream.put(xmlParts.getSharedStringXml(escapeXml(String(shared))));
    }
    this.sharedStringsXmlStream.put(xmlParts.sharedStringsFooter);
    this.sharedStringsXmlStream.stop();
  }

  commit() {
    this._addSheetFooter();
    this._serializeSharedString();
  }

  _getRowXml(row: any[], rowIndex: number): string {
    let rowXml = xmlParts.getRowStart(rowIndex);
    row.forEach((cellValue, colIndex) => {
      const cellAddress = getCellAddress(rowIndex + 1, colIndex + 1);
      const styleId = this.options.styleIdFunc(cellValue, colIndex, rowIndex);
      rowXml += this._getCellXml(cellValue, cellAddress, styleId);
    });
    rowXml += xmlParts.rowEnd;
    return rowXml;
  }

  _getCellXml(value: any, address: any, styleId = 0): string {
    let cellXml;

    if (Number.isNaN(value) || value === null || typeof value === 'undefined') cellXml = xmlParts.getStringCellXml('', address, styleId);
    else {
      switch (typeof value) {
        case 'number':
          cellXml = xmlParts.getNumberCellXml(value, address, styleId);
          break;
        case 'boolean':
          cellXml = xmlParts.getBooleanCellXml(value, address, styleId);
          break;
        case 'object':
          if (is(Date, value)) {
            cellXml = this._getStringCellXml(value, address, styleId);
          } else {
            const tempValue = JSON.stringify(value);
            cellXml = this._getStringCellXml(tempValue, address, styleId);
          }
          break;
        default:
          cellXml = this._getStringCellXml(value, address, styleId);
          break;
      }
    }

    return cellXml;
  }

  _getStringCellXml(value: any, address: any, styleId: number): string {
    const stringValue = String(value);
    // console.log(value, stringValue);
    return this.options.inlineStrings
      ? xmlParts.getInlineStringCellXml(escapeXml(String(value)), address, styleId)
      : xmlParts.getStringCellXml(this._lookupString(stringValue), address, styleId);
  }

  _lookupString(value: string): number {
    let sharedStringIndex: number = this.sharedStringsMap[value];
    if (typeof sharedStringIndex !== 'undefined') return sharedStringIndex;
    sharedStringIndex = this.sharedStringsArr.length;
    this.sharedStringsMap[value] = sharedStringIndex;
    this.sharedStringsArr.push(value);
    return sharedStringIndex;
  }

  _clearSharedStrings() {
    this.sharedStringsMap = {};
    this.sharedStringsArr = [];
  }

  // returns blob in a browser, buffer in nodejs
  getFile() {
    this._clearSharedStrings();
    const zip = new JSZip();
    // add all static files
    Object.keys(this.xlsx).forEach(key => zip.file(key, this.xlsx[key]));

    // add "xl/worksheets/sheet1.xml"
    zip.file('xl/worksheets/sheet1.xml', this.sheetXmlStream);
    // add "xl/sharedStrings.xml"
    zip.file('xl/sharedStrings.xml', this.sharedStringsXmlStream);
    this._clearSharedStrings();

    const isBrowser = typeof window !== 'undefined' && {}.toString.call(window) === '[object Window]';

    return new Promise((resolve, reject) => {
      if (isBrowser) {
        zip
          .generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 4,
            },
            streamFiles: true,
          })
          .then(resolve)
          .catch(reject);
      } else {
        zip
          .generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 4,
            },
            streamFiles: true,
          })
          .then(resolve)
          .catch(reject);
      }
    });
  }

  getStream(): NodeJS.ReadableStream {
    return this.zip.generateNodeStream(this.options.zip);
  }
}

function cleanUpXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}
