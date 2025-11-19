import * as winston from 'winston'
import WinstonDaily from 'winston-daily-rotate-file'

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetPath = path.join(__dirname, '../../Asset');

const logDir = path.join(assetPath, './Logs');

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf( ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} : ${message}`;
} );

const logger = winston.createLogger({
    format : combine(
        timestamp({ format : 'YYYY-MM-DD HH:mm:ss' }),
        label({ label : 'OxxO 번역 어플리케이션' }),
        logFormat,
    ),

    transports : [
        new WinstonDaily({
            level : 'info',
            datePattern : 'YYYY-MM-DD',
            dirname : logDir,
            filename : `%DATE%.log`,
            maxFiles : 30,
            zippedArchive: true,
        }),
        new WinstonDaily({
            level : 'error',
            datePattern : 'YYYY-MM-DD',
            dirname : path.join(logDir, './error'),
            filename : `%DATE%.error.log`,
            maxFiles : 30,
            zippedArchive : true,
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
   logger.add(
      new winston.transports.Console({
         format: winston.format.combine(
            winston.format.colorize(), // 색깔 넣어서 출력
            winston.format.simple(), // `${info.level}: ${info.message} JSON.stringify({ ...rest })` 포맷으로 출력
         ),
      }),
   );
}

export default logger;