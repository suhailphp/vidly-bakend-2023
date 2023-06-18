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

module.exports = class ProductUnitService {
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
      if (['nameAr', 'nameEn', 'createdOn', 'parent'].indexOf(order.column) === -1) throw new BadRequestError(('Invalid input provided'));

      const where = {
        deleted,
        [Op.or]: [
          { nameAr: { [Op.like]: `%${searchQuery}%` } },
          { nameEn: { [Op.like]: `%${searchQuery}%` } },
        ],
      };
      const include = [
        {
          model: Models.Department,
          required: false,
          as: 'Parent',
          attributes: ['nameAr', 'nameEn'],
        },
      ];
      let queryAttributes = { exclude: [] };
      if (attributes && attributes.length) {
        queryAttributes = attributes;
      }
      // if (order.column && order.column === 'createdBy') order.column = ['$userCreatedBy.fullNameEn$'];
      const data = await Models.Department.findAndCountAll(
        {
          include,
          where,
          attributes: queryAttributes,
          order: [
            [order.column, order.dir],
          ],
          limit: length,
          offset: start,
        },
      );
      // console.log('data', data.rows[0].userCreatedBy);
      const count = await Models.Department.count({ where: { deleted } });
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

  async getOne(departmentID) {
    try {
      const include = [
        {
          model: Models.Department,
          required: false,
          as: 'Parent',
          attributes: ['nameAr', 'nameEn'],
        },

      ];
      const resData = await Models.Department.findOne({
        where: { departmentID },
        include,
      });
      return (resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll(cond = null) {
    try {
      const where = { active: true, deleted: false };
      if (cond && cond.level) { where.level = cond.level; }
      if (cond && cond.parentID) { where.parentID = cond.parentID; }
      if (cond && cond.departmentID) { where.departmentID = { [Op.not]: cond.departmentID }; }
      const resData = await Models.Department.findAll({
        where,
        attributes: ['nameAr', 'nameEn', 'departmentID', 'parentID'],
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
    parentID,

    level,
    creatEdemployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      await Models.Department.create({
        nameEn,
        nameAr,
        parentID: (parentID) || null,
   
        level,
        // creatEdemployeeID,
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

    departmentID,
    parentID,
    level,
    updatedEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const resData = await Models.Department.findOne({ where: { departmentID }, transaction });
      resData.nameEn = nameEn;
      resData.nameAr = nameAr;

      resData.level = level;
      resData.parentID = (parentID) || null;
      // resData.updatedEmployeeID = updatedEmployeeID;
      resData.updatedOn = Date.now();
      await resData.save({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async changeStatus(departmentID) {
    try {
      const data = await Models.Department.findOne({
        where: { departmentID },
        attributes: ['departmentID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(departmentID, deletedEmployeeID) {
    try {
      const resData = await Models.Department.findOne({
        where: { departmentID },
        attributes: ['departmentID', 'deleted'],
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

  async delete(departmentID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Department.findOne({
        where: { departmentID },
        attributes: ['departmentID'],
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
