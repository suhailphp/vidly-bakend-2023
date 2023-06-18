const i18n = require('i18n');
const { use } = require('browser-sync');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ApplicationError,
} = require('../modules/error');
const validation = require('../utilities/validation');
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
  /* get Function */
  async get({
    query,
    attributes,
    deleted,
  }) {
    try {
      logger.silly('Getting user db record');
      const language = i18n.getLocale();
      const searchQuery = query.search ? query.search.value.trim() : '';
      // console.log(searchQuery);
      const start = parseInt(query.start);
      const length = parseInt(query.length);
      // console.log(query.order);
      const order = query.order ? query.order[0] : {
        column: 'createdOn',
        dir: 'ASC',
      };
      // console.log('coloumn', order.column);
      if (['nameAr', 'nameEn', 'createdOn', ].indexOf(order.column) === -1) throw new BadRequestError(('Invalid input provided'));

      const where = {
        deleted,
        [Op.or]: [
          { nameAr: { [Op.like]: `%${searchQuery}%` } },
          { nameEn: { [Op.like]: `%${searchQuery}%` } },
        ],
      };

      let queryAttributes = { exclude: [] };
      if (attributes && attributes.length) {
        queryAttributes = attributes;
      }
      // if (order.column && order.column === 'createdBy') order.column = ['$userCreatedBy.fullNameEn$'];
      const data = await Models.CourseLevel.findAndCountAll(
        {
          where,
          attributes: queryAttributes,
          order: [
            [order.column, order.dir],
          ],
          limit: length,
          offset: start,
        },
      );
       //console.log('data', data.rows[0]);
      const count = await Models.CourseLevel.count({ where: { deleted } });
      // console.log(count);
      return {
        ...data,
        totalCount: count,
      };
    } catch (e) {
      // if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async getOne(courseLevelID) {
    try {
     
      const resData = await Models.CourseLevel.findOne({
        include:[
          {model:Models.Employee,as:'createdBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'updatedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'deletedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
        ],
        where: { courseLevelID },
      });
      return (resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll(cond = null) {
    try {
      const where = { active: true, deleted: false };
      const resData = await Models.CourseLevel.findAll({
        where,
        attributes: ['nameAr', 'nameEn', 'courseLevelID','level'],
      });
      return (resData);
    } catch (e) {
      //console.log(e);
      throw new ApplicationError(e.message);
    }
  }

  /* PostFunction */
  async insert({
    nameEn,
    nameAr,
    level,
    createdEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      await Models.CourseLevel.create({
        nameEn,
        nameAr,
        level,
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
    nameEn,
    nameAr,
    courseLevelID,
    level,
    updatedEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const resData = await Models.CourseLevel.findOne({ where: { courseLevelID }, transaction });
      resData.nameEn = nameEn;
      resData.nameAr = nameAr;
      resData.level = level;
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

  async changeStatus(courseLevelID) {
    try {
      const data = await Models.CourseLevel.findOne({
        where: { courseLevelID },
        attributes: ['courseLevelID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(courseLevelID, deletedEmployeeID) {
    try {
      const resData = await Models.CourseLevel.findOne({
        where: { courseLevelID },
        attributes: ['courseLevelID', 'deleted'],
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

  async delete(courseLevelID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseLevel.findOne({
        where: { courseLevelID },
        attributes: ['courseLevelID'],
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
