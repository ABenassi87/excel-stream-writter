import * as helpers from './helpers';

const replaceRegex: RegExp = /\s+/g;
const replaceReSec: RegExp = />\s+</g;

export const header: string = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            mc:Ignorable="x14ac"
            xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">`;

export const bottom: string = '</styleSheet>';

export const getFillXmlHeader = (numFills: number) => `<fills count="${numFills}">`;
export const fillXmlDefault: string[] = [
  `<fill>
  <patternFill patternType="none"/>
  </fill>`,
  `<fill>
  <patternFill patternType="gray125"/>
  </fill>`
];

export const getFillXml = (fillColor: string) =>
  `<fill><patternFill patternType="solid"><fgColor rgb="${fillColor}"/><bgColor indexed="64"/></patternFill></fill>`;

export const fillXmlBottom: string = '</fills>';

export const fontsXml: string = `<fonts count="1" x14ac:knownFonts="1">
        <font>
            <sz val="11"/>
            <color theme="1"/>
            <name val="Calibri"/>
            <family val="2"/>
            <scheme val="minor"/>
        </font>
    </fonts>`;

export const bordersXml: string = `
    <borders count="1">
        <border>
            <left/>
            <right/>
            <top/>
            <bottom/>
            <diagonal/>
        </border>
    </borders>`;

export const cellStyleXfs: string = `<cellStyleXfs count="1">
  <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>`;

export const getCellXfXml = (data: { numFmtId: number; fillId: number }) =>
  `<xf numFmtId="${data.numFmtId === undefined ? 0 : data.numFmtId}" fontId="0" fillId="${
    data.fillId === undefined ? 0 : data.fillId
  }" borderId="0" xfId="0"/>`;

export const cellXfXmlDefault: string[] = [`<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>`];

export function getCellXfsBlock(cellXfs: any[]): string {
  return `<cellXfs count="${cellXfs.length}">${cellXfs.join('')}</cellXfs>`;
}

export const restXml: string = `<cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
    <dxfs count="0"/>
    <tableStyles count="0" defaultTableStyle="TableStyleMedium2"
                 defaultPivotStyle="PivotStyleLight16"/>
    <extLst>
        <ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}"
             xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">
            <x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/>
        </ext>
    </extLst>`;

export const compact = (xml: string) =>
  xml
    .replace(replaceRegex, ' ')
    .replace(replaceReSec, '><')
    .trim();

/**
 * @param { Array<Object> } styles
 * each style could have { fill, format }
 * Numbering Formats
 Fonts
 Fills
 Borders
 Cell Style Formats
 Cell Formats <== cell styleindex is referring to one of these
 ...the rest
 * @returns { String } styles.xml string
 * */
export function getStyles(styles: any[]): string {
  const NUM_FORMATS_START = 166;
  const numFormatsXml: string[] = [];
  const numFormatsIndex: any = {};
  const fillsXml = fillXmlDefault;
  const fillsIndex: any = {};
  const cellXfsXml = cellXfXmlDefault;
  styles.forEach(style => {
    const { fill, format } = style;
    if (format !== undefined) {
      if (numFormatsIndex[format] === undefined) {
        const formatIndex = numFormatsXml.length + NUM_FORMATS_START;
        numFormatsIndex[format] = formatIndex;
        numFormatsXml.push(getFormatXml(helpers.escapeXmlExtended(format), formatIndex));
      }
    }
    if (fill !== undefined) {
      if (fillsIndex[fill] === undefined) {
        fillsIndex[fill] = fillsXml.length;
        fillsXml.push(getFillXml(helpers.escapeXmlExtended(fill)));
      }
    }
    cellXfsXml.push(
      getCellXfXml({
        numFmtId: numFormatsIndex[format],
        fillId: fillsIndex[fill]
      })
    );
  });

  let xml = '';
  xml += header;
  xml += getNumFormatsXmlBlock(numFormatsXml);
  xml += fontsXml;
  xml += getFillXmlBlock(fillsXml);
  xml += bordersXml;
  xml += cellStyleXfs;
  xml += getCellXfsBlock(cellXfsXml);
  xml += restXml;
  xml += bottom;
  return compact(xml);
}

export const getFormatXml = (format: any, length: number) => `<numFmt numFmtId="${length}" formatCode="${format}"/>`;

export function getNumFormatsXmlBlock(formats: any[]): string {
  if (!Array.isArray(formats) || !formats.length) return '';
  return `<numFmts count="${formats.length}">${formats.join('')}</numFmts>`;
}

export function getFillXmlBlock(fillsXml: string[]): string {
  return getFillXmlHeader(fillsXml.length) + fillsXml.join('') + fillXmlBottom;
}
