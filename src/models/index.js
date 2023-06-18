const { Op } = require('@sequelize/core');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const config = require('../config');
const sequelize = require('../modules/sequelize');
const logger = require('../modules/logger');

const basename = path.basename(__filename);
const db = {};
function applyExtraSetup(/* sequelize */) {
  // extra joins
}
/**
 * Init models
 */
fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    require(path.join(__dirname, file))(sequelize);
  });
Object
  .keys(sequelize.models)
  .forEach((modelName) => {
    if (sequelize.models[modelName].associate) {
      sequelize
        .models[modelName]
        .associate(sequelize.models);
    }
  });
applyExtraSetup(sequelize);
if (config.DB.SYNC) {
  sequelize
    .sync({ force: config.DB.SYNC_FORCE, alter: config.DB.ALTER })
    .then(async () => {
      // eslint-disable-next-line new-cap
      // const con = new sequelizeDBConnection.models.configuration();
      // config.system = await con.getKeyValue();
      // logger.info('✌️ Config loaded from DB %s', JSON.stringify(config.system));

      const [UserResp, created] = await sequelize.models
        .Employee
        .findOrCreate({
          where: {
            userName: 'suhail',
          },
          defaults: {
            fullNameEn: 'Suhail Malayantavida',
            fullNameAr: 'سهيل مالايانتافيدا كونها عبدالله',
            userName: 'suhail',
            password: '7c337c005fd861d11d45cef7d7e00bc7d4e29f5b2932ea7f7e9cfe9c061944b6eb3027de0c7c77beb82b7919f9137f671a8e499812c76546c9b3085eb4325169',
            passwordSalt: 'a355fa04b0ddeaa6bcb1f8c2d9517049',
            createdEmployeeID: 1,
            militaryNumber: 27301,
            userType: 'SUPER-ADMIN',
            email: 'suhail@psa.ac.ae',
            active: true,
            ADLogin: false,
            isAdmin: true,
            isSuperAdmin: true,
          },
        });
    })
    .catch((e) => logger.error(e));
}
logger.info('✌️ Models loaded');
// module.exports = init;
const query = {
  select: (queryTxt, transaction) => sequelize.query(queryTxt, {
    type: sequelize.QueryTypes.SELECT,
    transaction,
  }),
};

module.exports = {
  ...sequelize.models,
  sequelize,
  Op,
  query,
  db,
};
