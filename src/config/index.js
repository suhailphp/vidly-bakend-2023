const dotConf = { silent: true };
if (process.env.ENV_FILE) {
  dotConf.path = process.env.ENV_FILE;
  const fs = require('fs');
  if (!fs.existsSync(dotConf.path)) {
    console.log('ENV file doesnt exist on : ', dotConf.path);
    process.exit();
  }
}
require('dotenv').config(dotConf);

const port = process.env.PORT;
const env = process.env.NODE_ENV;
if (typeof env === 'undefined' || !env) {
  console.error(new Error('ENV File not provided'));
  process.exit();
}
const Years = [];
for (let i = 2010; i < (new Date().getFullYear() + 10); i++) { Years.push(i); }
module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'silly',
  VERSION: require('../../package.json').version,
  YEAR: new Date().getFullYear(),
  PORT: port,
  ENV: env,
  APP_NAME: process.env.APP_NAME,
  HOST_URL: process.env.HOST_URL,
  BASE_URL: process.env.BASE_URL,
  APP_LOGO_URL: process.env.APP_LOGO_URL || '/dist/assets/media/logos/logo-psa.svg',
  SESSION: {
    COOKIE_NAME: process.env.COOKIE_NAME,
    SECRET: process.env.SESSION_SECRET,
    COOKIE_AGE: 1 * 24 * 60 * 60 * 1000, // 1 DAY
    COOKIE_AGE_REMEMBER_ME: 7 * 24 * 60 * 60 * 1000, // 7 DAY
    PREFIX: `${process.env.APP_NAME}-SESS-`,
  },
  DB: {
    DIALECT: process.env.DB_DIALECT,
    STORAGE: process.env.DB_STORAGE,
    DATABASE: process.env.DB_NAME,
    USERNAME: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    HOST: process.env.DB_HOST,
    PORT: parseInt(process.env.DB_PORT),
    SYNC: true, // : "Do not use this Unless you want to starts from zero",
    ALTER: false, // : Altersr tables when sync if there is any change to make.
    QUERY_LOG: false,
    SYNC_FORCE: false, // : "Do not use this Unless you want to set default values",
  },
  DOMAIN: {
    url: process.env.AD_URL,
    baseDN: process.env.AD_BASE_DN,
    username: process.env.AD_USERNAME,
    password: process.env.AD_PASSWORD,
  },
  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
    QUEUE_DB: process.env.REDIS_QUEUE_DB || 0,
    DB_RATE_LIMIT: process.env.REDIS_DB_RATE_LIMIT || 0,
    DB_CACHE: process.env.REDIS_DB_CACHE || 0,
    EMAIL_QUEUE_NAME: process.env.REDIS_EMAIL_QUEUE_NAME || 'PSA-EMAIL-QUEUE',
  },
  RATE_LIMITER: {
    PREFIX: 'RateLimit_',
    ACTIVE: true,
    TRIES: 10, // limit each IP to 10
    TIME_LIMIT: 5 * 60 * 1000,
  },
  YEARS: Years,
  STATUS: {
    D: 'DEPARTMENT',
    A: 'ADMINISTRATOR',
    F: 'FINAL',
  },
  CACHE: {
    PREFIX: `${process.env.APP_NAME}-CACHE-`,
    TTL: 3600,
  },
};
