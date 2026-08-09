
const { app } = require('electron');

const winston = require("winston");
const WinstonDaily = require('winston-daily-rotate-file')

const path = require('node:path');

const serverRoot = path.join( path.resolve(__dirname, '..'), 'server');
const assetRoot = path.join( app.getPath('userData'), 'Asset' );

const assetPath = assetRoot !== undefined ? path.resolve( assetRoot ) : path.join(serverRoot, 'Asset');

const logDir = path.join(assetPath, './Logs');

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf( ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} : ${message}`;
} );

const logger = winston.createLogger({
    format : combine(
        timestamp({ format : 'YYYY-MM-DD HH:mm:ss' }),
        label({ label : 'OxxO console log' }),
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

module.exports = logger;
