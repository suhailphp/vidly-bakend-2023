const config = require('../config');

module.exports = {
  dialect: config.DB.DIALECT,
  // storage: config.DB.STORAGE,
  username: config.DB.USERNAME,
  password: config.DB.PASSWORD,
  database: config.DB.DATABASE,
  host: config.DB.HOST,
  seederStorage: 'sequelize',
  dialectOptions: { options: { encrypt: false } },
};
