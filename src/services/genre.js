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

module.exports = class courseLevelService {

  async get({
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const resData = await Models.Genre.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { deleted },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['name'],
            allowedSortColumns: ['name','createdOn'],
          }),
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOne(genreID) {
    try {
     
      const resData = await Models.Genre.findOne({
        include:[
          {model:Models.Employee,as:'createdBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'updatedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'deletedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
        ],
        where: { genreID },
      });
      return (resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll(cond = null) {
    try {
      const where = { active: true, deleted: false };
      const resData = await Models.Genre.findAll({
        where,
        attributes: ['name', 'genreID'],
      });
      return (resData);
    } catch (e) {
      //console.log(e);
      throw new ApplicationError(e.message);
    }
  }

  /* PostFunction */
  async insert({
    name,
    createdEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      await Models.Genre.create({
        name,
        createdEmployeeID,
      }, { transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async update({
    name,
    genreID,
    updatedEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const resData = await Models.Genre.findOne({ where: { genreID }, transaction });
      resData.name = name;
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

  async changeStatus(genreID) {
    try {
      const data = await Models.Genre.findOne({
        where: { genreID },
        attributes: ['genreID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(genreID, deletedEmployeeID) {
    try {
      const resData = await Models.Genre.findOne({
        where: { genreID },
        attributes: ['genreID', 'deleted'],
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

  async delete(genreID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Genre.findOne({
        where: { genreID },
        attributes: ['genreID'],
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
