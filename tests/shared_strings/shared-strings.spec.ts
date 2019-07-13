import { XlsxStreamWriter } from '../../src/xlsx-stream-writer';
import { rows } from '../helpers';
import { getXmlFromXmlStream } from '../../src/helpers';

const sharedStringsXmlExpected = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="8" uniqueCount="8"><si><t>Name</t></si><si><t>Location</t></si><si><t>Alpha</t></si><si><t>Adams</t></si><si><t>Bravo</t></si><si><t>Boston</t></si><si><t>Charlie</t></si><si><t>Chicago</t></si></sst>`;

describe('Shared Stringsa', () => {
  it('correctly generates shared strings xml for basic excel sheet', async () => {
    const xlsx = new XlsxStreamWriter();
    xlsx.addRows(rows);
    await getXmlFromXmlStream(xlsx.sheetXmlStream);
    return expect(getXmlFromXmlStream(xlsx.sharedStringsXmlStream)).resolves.toBe(sharedStringsXmlExpected);
  });

  it('shared strings array is empty if inlineStrings: true option is set', async () => {
    const xlsx = new XlsxStreamWriter({ inlineStrings: true });
    xlsx.addRows(rows);
    const sheetXml = await getXmlFromXmlStream(xlsx.sheetXmlStream);
    // console.log(sheetXml);
    return expect(xlsx.sharedStringsArr.length).toEqual(0);
  });
});
