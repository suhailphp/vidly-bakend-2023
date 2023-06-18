const winston = require('winston');
const config = require('../config');

const transports = [];
if (config.ENV !== 'development') {
  transports.push(new winston.transports.Console());
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.cli(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(({
          level, message, timestamp, stack,
        }) => {
          if (stack) {
            // print log trace
            return `${level}: ${message} - ${stack}`;
          }
          return `${level}: ${message}`;
        }),
      ),
    }),
  );
}
const LoggerInstance = winston.createLogger({
  level: config.LOG_LEVEL,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});
module.exports = LoggerInstance;
