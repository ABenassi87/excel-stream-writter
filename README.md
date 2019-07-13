# Excel Stream Writer

---

This repo is a based on https://github.com/baranovxyz/xlsx-stream-writer. I moved the code to TypeScript.

---

This was rewritten from coffee script https://github.com/rubenv/node-xlsx-writer and
changed to work both in browser and nodejs. Api is completely different from rubenv
implementation.

It is actually capable of streaming rows into xlsx file both in browser and nodejs.

It uses JSZip to compress resulting structure. Lucky for us JSZip is capable of
processing readable streams, so we just stream rows into xlxs file (which is a zip file).

Plans:

- improve api
- add tests
- make browser build, put on some cdn
- optimize shared string stuff
- (maybe) use web workers to build xlsx in browser
- (maybe) implement some specifis for nodejs

Example on express server:
```typescript
import { Request, Response } from 'express';
import { XlsxStreamWriter } from 'xlsx-stream-writer';

function generateFile(req: Request, res: Response) {
  const rows = [['Name', 'Location'], ['Alpha', 'Adams'], ['Bravo', 'Boston'], ['Charlie', 'Chicago']];
  const xlsxWriter = new XlsxStreamWriter();

  xlsxWriter.addRows(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'example.xlsx');

  xlsxWriter
    .getStream()
    .on('end', function() {
      console.log('zip stream ended.');
    })
    .pipe(res)
    .on('finish', function() {
      // JSZip generates a readable stream with a "end" event,
      // but is piped here in a writable stream which emits a "finish" event.
      console.log('zip finished.');
      res.end();
    });

  for (let i = 0; i < 1; i++) {
    const rowsData = [['Name', 'Location'], ['Alpha', 'Adams'], ['Bravo', 'Boston'], ['Charlie', 'Chicago']];
    console.log('Added new data.');
    xlsxWriter.addRows(rowsData);
  }

  // All data was read 
  xlsxWriter.commit();
}
```
