import { createLogger, format, transports } from 'winston';

const { combine, timestamp, label, colorize, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'XLSX-Writer' }), timestamp(), colorize(), myFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: './error.log', level: 'error' }),
    new transports.File({ filename: './info.log', level: 'info' }),
  ],
  exitOnError: false,
});

export default logger;
