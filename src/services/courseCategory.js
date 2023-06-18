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
const { log } = require('console');

module.exports = class CourseCategoryService {
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
      const data = await Models.CourseCategory.findAndCountAll(
        {
          where,
          include:[{model:Models.CourseLevel,as:'courseLevel'}],
          attributes: queryAttributes,
          order: [
            [order.column, order.dir],
          ],
          limit: length,
          offset: start,
        },
      );
       //console.log('data', data.rows[0]);
      const count = await Models.CourseCategory.count({ where: { deleted } });
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

  async getOne(courseCategoryID) {
    try {
      
      const resData = await Models.CourseCategory.findOne({
        include:[
          {model:Models.CourseLevel,as:'courseLevel',attributes:['nameAr','nameEn']},
          {model:Models.Employee,as:'createdBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'updatedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
          {model:Models.Employee,as:'deletedBy',attributes:['fullNameEn','fullNameAr','profilePhotoDocumentID', 'employeeID']},
        ],
        where: { courseCategoryID },
      });
      return (resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll() {
    try {
      const resData = await Models.CourseCategory.findAll({
        where:{ active: true, deleted: false },
        attributes: ['nameAr', 'nameEn', 'courseCategoryID'],
      });
      return (resData);
    } catch (e) {
      console.log(e);
      throw new ApplicationError(e.message);
    }
  }


  /* PostFunction */
  async insert({
    nameEn,
    nameAr,
    courseLevelID,
    createdEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      await Models.CourseCategory.create({
        nameEn,
        nameAr,
        courseLevelID,
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
    courseCategoryID,
    courseLevelID,
    updatedEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const resData = await Models.CourseCategory.findOne({ where: { courseCategoryID }, transaction });
      resData.nameEn = nameEn;
      resData.nameAr = nameAr;
      resData.courseLevelID = courseLevelID;
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

  async changeStatus(courseCategoryID) {
    try {
      const data = await Models.CourseCategory.findOne({
        where: { courseCategoryID },
        attributes: ['courseCategoryID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(courseCategoryID, deletedEmployeeID) {
    try {
      const resData = await Models.CourseCategory.findOne({
        where: { courseCategoryID },
        attributes: ['courseCategoryID', 'deleted'],
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

  async delete(courseCategoryID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseCategory.findOne({
        where: { courseCategoryID },
        attributes: ['courseCategoryID'],
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
