import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

const isProduction = process.env.NODE_ENV === 'production';

export const winstonConfig: WinstonModuleOptions = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
    isProduction ? winston.format.uncolorize() : winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug', // Define o nível de log para console
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
  ],
};
