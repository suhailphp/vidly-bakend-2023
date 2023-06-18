const i18n = require('i18n');
const { use } = require('browser-sync');
const appConfig = require('../config');
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
const pagination = require('../utilities/pagination');
const { log } = require('console');

module.exports = class CourseDocumentService {

  async get({
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');

      const resData = await Models.CourseDepartment.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { deleted },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['nameAr', 'nameEn', ],
            allowedSortColumns: ['nameEn', 'nameAr',  'createdOn'],
          }),
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }


  

  async getOne(courseDepartmentID = null) {
    try {
      const include = [
        {
          model: Models.Employee,
          required: false,
          as: 'createdBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.Employee,
          required: false,
          as: 'updatedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.Employee,
          required: false,
          as: 'deletedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.CourseLevel,
          required: false,
          as: 'courseLevel',
          attributes: ['nameAr', 'nameEn', ],
        },
        
      ];
      const data = await Models.CourseDepartment.findOne({
        where: { courseDepartmentID },
        include,
      });
      return (data);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll() {
    try {
      const data = await Models.CourseDepartment.findAndCountAll({
        where: { active: true, deleted: false },
        attributes: ['nameEn', 'nameAr', 'courseDepartmentID', 'courseDepartmentDocumentID'],
      });
      // console.log(employee);
      return (data);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  

 

  async getImage(courseDepartmentID) {
    try {
      const document = await Models.CourseDepartment.findOne({
        where: { courseDepartmentID },
        attributes: ['courseDepartmentID'],
        include: [
          { model: Models.Document, as: 'logo' },
        ],
      });
      return (document);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  /* PostFunction */
  async insert({
    nameEn,
    nameAr,
    courseLevelID,
    logo,
    createdEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      let courseDepartmentDocumentID = null;
      if (logo && logo.buffer) {
        const documents = {
          title: logo.fieldname,
          fileName: logo.originalname,
          fileType: logo.mimetype,
          data: logo.buffer,
          documentCreatedemployeeID: createdEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        courseDepartmentDocumentID = docResp.documentID;
      }
      await Models.CourseDepartment.create({
        nameEn,
        nameAr,
        courseLevelID,
        courseDepartmentDocumentID,
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
    courseDepartmentID,
    nameEn,
    nameAr,
    courseLevelID,
    logo,
    updatedEmployeeID,
  }) {
    let transaction;

    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseDepartment.findOne({ where: { courseDepartmentID }, transaction });
      if (logo && logo.buffer) {
        // delte existing document
        await Models.Document.destroy({ where: { documentID: data.courseDepartmentDocumentID }, transaction });
        const documents = {
          title: logo.fieldname,
          fileName: logo.originalname,
          fileType: logo.mimetype,
          data: logo.buffer,
          documentCreatedemployeeID: updatedEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        data.courseDepartmentDocumentID = docResp.documentID;
      }

      data.nameEn = nameEn;
      data.nameAr = nameAr;
      data.courseLevelID = courseLevelID;
      data.updatedEmployeeID = updatedEmployeeID;
      data.updatedOn = Date.now();
      await data.save({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  

  async changeStatus(courseDepartmentID) {
    try {
      const data = await Models.CourseDepartment.findOne({
        where: { courseDepartmentID },
        attributes: ['courseDepartmentID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(courseDepartmentID, deletedEmployeeID) {
    try {
      const resData = await Models.CourseDepartment.findOne({
        where: { courseDepartmentID },
        attributes: ['courseDepartmentID', 'deleted'],
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

  async delete(courseDepartmentID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseDepartment.findOne({
        where: { courseDepartmentID },
        attributes: ['courseDepartmentID', 'courseDepartmentDocumentID'],
        transaction,
      });
      await Models.Document.destroy({ where: { documentID: data.courseDepartmentDocumentID }, transaction });
      await data.destroy({ transaction });
      await transaction.commit();
      return (data);
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e);
    }
  }
};
