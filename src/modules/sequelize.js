const { Sequelize } = require('@sequelize/core');
const logger = require('./logger');
const config = require('../config');
const sequelizeDB = new Sequelize({
    dialect: config.DB.DIALECT,
    storage: config.DB.STORAGE,
    database: config.DB.DATABASE,
    username: config.DB.USERNAME,
    password: config.DB.PASSWORD,
    host: config.DB.HOST,
    port: config.DB.PORT,
    // timezone: config.DB.TIMEZONE,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    dialectOptions: {
        options: {
            encrypt: false,
            requestTimeout: 60000,
            validateBulkLoadParameters: false,
        },
    },
    logging: config.DB.QUERY_LOG,
    freezeTableName: true, // If false the model name will be pluralized eg. User to Users
    define: {
        timestamps: false,
    }
});
sequelizeDB
    .authenticate()
    .then(() => {
        logger.info(
            `✌️ ${config.DB.HOST} ${config.DB.DATABASE} DB Connection has been established successfully.`,
        );
    }).catch((err) => {
        logger.error(
            `Unable to connect to the ${config.DB.HOST} database: ${config.DB.DATABASE}`,
        );
        logger.error(err);
    });
module.exports = sequelizeDB;