const i18n = require('i18n');
const { use } = require('browser-sync');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ApplicationError,
} = require('../modules/error');
const validation = require('../utilities/validation');
const pagination = require('../utilities/pagination');
const {
  sequelize,
  Op,
  // query: Query
} = require('../models/index');

// const { models } = sequelize;
const Models = require('../models');
const logger = require('../modules/logger');
const Utils = require('../utilities');
const { log } = require('handlebars');

module.exports = class movieService {

  async get({
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const resData = await Models.Movie.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { deleted },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['title','numberInStock','dailyRentalRate','$Genre.name$'],
            allowedSortColumns: ['title','dailyRentalRate','numberInStock','createdOn',
            {
              key: 'Genre', model: { model: Models.Genre, as: 'Genre' }, field: 'name',
            },
          ],
          }),
          include:[
            { model: Models.Genre, as: 'Genre'}
          ],
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOne(movieID) {
    try {
     
      const resData = await Models.Movie.findOne({
        include:[
          {model:Models.Genre,as:'Genre',attributes:['name']},
          {model:Models.Employee,as:'createdBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'updatedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'deletedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
        ],
        where: { movieID },
      });
      return (resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }


  /* PostFunction */
  async insert({
    title,
    dailyRentalRate,
    numberInStock,
    genreID,
    createdEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      await Models.Movie.create({
        title,
        dailyRentalRate:parseFloat(dailyRentalRate),
        numberInStock:parseInt(numberInStock),
        genreID,
        createdEmployeeID,
      }, { transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async update({
    title,
    dailyRentalRate,
    numberInStock,
    genreID,
    movieID,
    updatedEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const resData = await Models.Movie.findOne({ where: { movieID }, transaction });
      resData.title = title;
      resData.dailyRentalRate = parseFloat(dailyRentalRate);
      resData.numberInStock = parseInt(numberInStock);
      resData.genreID = genreID;
      resData.updatedEmployeeID = updatedEmployeeID;
      resData.updatedOn = Date.now();
      await resData.save({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async changeStatus(movieID) {
    try {
      const data = await Models.Movie.findOne({
        where: { movieID },
        attributes: ['movieID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(movieID, deletedEmployeeID) {
    try {
      const resData = await Models.Movie.findOne({
        where: { movieID },
        attributes: ['movieID', 'deleted'],
      });
      resData.deleted = !resData.deleted;
      if (resData.deleted) {
        resData.deletedEmployeeID = deletedEmployeeID;
        resData.deletedOn = Date.now();
      } else {
        resData.deletedEmployeeID = null;
        resData.deletedOn = null;
      }
      await resData.save();
      return (resData);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async delete(movieID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Movie.findOne({
        where: { movieID },
        attributes: ['movieID'],
        transaction,
      });
      await data.destroy({ transaction });
      await transaction.commit();
      return (data);
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e);
    }
  }
};
