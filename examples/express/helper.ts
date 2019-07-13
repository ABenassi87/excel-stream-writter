import * as faker from 'faker';
import { Readable } from 'stream';

const htmlBody =
  '<!DOCTYPE html>\n' +
  '<html>\n' +
  '<head>\n' +
  '<!-- HTML Codes by Quackit.com -->\n' +
  '<title>\n' +
  'Test</title>\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<meta name="keywords" content="Teest">\n' +
  '<meta name="description" content="Test">\n' +
  '<style>\n' +
  'body {background-color:#ffffff;background-repeat:no-repeat;background-position:top left;background-attachment:fixed;}\n' +
  'h1{font-family:Arial, sans-serif;color:#000000;background-color:#ffffff;}\n' +
  'p {font-family:Georgia, serif;font-size:14px;font-style:normal;font-weight:normal;color:#000000;background-color:#ffffff;}\n' +
  '</style>\n' +
  '</head>\n' +
  '<body>\n' +
  '<h1>sghjkshjkls</h1>\n' +
  '<p>ushjkhskhsjkbks nms</p>\n' +
  '</body>\n' +
  '</html>\n';

export function generateRandomData(count: number, generateHeader = false): any[] {
  let dataArray: any[] = [];
  if (generateHeader) {
    const header = [
      'firstName',
      'lastName',
      'streetAddress',
      'birthdate',
      'ssin',
      'valid',
      'city',
      'state',
      'country',
      'email',
      'avatar',
      'card',
      'userCard',
      'transaction',
      'test1',
      'test2',
      'test3',
      'htmlBody',
    ];
    dataArray.push(header);
  }
  for (let i = 0; i < count; i++) {
    const data = [
      faker.name.firstName(),
      faker.name.lastName(),
      faker.address.streetAddress(true),
      faker.date.past(),
      faker.random.number(),
      faker.random.number() % 2 === 0,
      faker.address.city(),
      faker.address.state(),
      faker.address.country(),
      faker.internet.email(),
      faker.internet.avatar(),
      faker.helpers.createCard(),
      faker.helpers.userCard(),
      faker.helpers.createTransaction(),
      faker.helpers.randomize(),
      faker.helpers.shuffle(),
      faker.helpers.slugify(),
      htmlBody,
    ];

    dataArray.push(data);
  }
  return dataArray;
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
