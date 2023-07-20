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

module.exports = class EmployeeService {

  async get({
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const resData = await Models.Employee.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { deleted },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['fullNameAr', 'fullNameEn', 'userName', 'email', 'userType'],
            allowedSortColumns: ['fullNameEn', 'fullNameAr', 'userType', 'email', 'createdOn'],
          }),
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }


  async getOne(employeeID) {
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
        
      ];
      const employee = await Models.Employee.findOne({
        where: { employeeID },
        include,
      });
      // console.log(employee);
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAll() {
    try {
      const employee = await Models.Employee.findAll({
        where: { active: true, deleted: false },
        attributes: ['fullNameEn', 'fullNameAr', 'employeeID', 'profilePhotoDocumentID'],
      });
      // console.log(employee);
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAllFinanceHead() {
    try {
      const employee = await Models.Employee.findAll({
        where: { active: true, deleted: false },
        attributes: ['fullNameEn', 'fullNameAr', 'employeeID', 'profilePhotoDocumentID', 'email'],
      });
      // console.log(employee);
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getAllCCContacts() {
    try {
      const employee = await Models.Employee.findAndCountAll({
        where: { active: true, deleted: false },
        attributes: ['fullNameEn', 'fullNameAr', 'employeeID', 'profilePhotoDocumentID', 'email'],
      });
      const ccList = [];
      for (let i = 0; i < employee.count; i++) {
        ccList.push({
          value: employee.rows[i].employeeID, nameAr: employee.rows[i].fullNameAr, nameEn: employee.rows[i].fullNameEn, avatar: `${appConfig.BASE_URL}employee/document/${employee.rows[i].employeeID}`, email: employee.rows[i].email,
        });
      } // console.log(employee);
      return (JSON.stringify(ccList));
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getUserName(userName) {
    try {
      const employee = await Models.Employee.findOne({ where: { userName } });
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getImage(employeeID) {
    try {
      const document = await Models.Employee.findOne({
        where: { employeeID },
        attributes: ['employeeID'],
        include: [
          { model: Models.Document, as: 'profilePhoto' },
        ],
      });
      return (document);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  /* PostFunction */
  async insert({
    fullNameEn,
    fullNameAr,
    userName,
    userType,
    userPrivileges,
    email,
    mobile,
    militaryNumber,
    ADLogin,
    password,
    profilePhoto,
    currentEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      let profilePhotoDocumentID = null;
      if (profilePhoto && profilePhoto.buffer) {
        const documents = {
          title: profilePhoto.fieldname,
          fileName: profilePhoto.originalname,
          fileType: profilePhoto.mimetype,
          data: profilePhoto.buffer,
          documentCreatedemployeeID: currentEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        profilePhotoDocumentID = docResp.documentID;
      }
      ADLogin = !!(ADLogin);
      const { passwordSalt, passwordHash } = Utils.crypto.getHashSalt(password);
      password = passwordHash;
      const employee = await Models.Employee.create({
        fullNameEn,
        fullNameAr,
        userName,
        userType,
        userPrivileges,
        email,
        mobile,
        militaryNumber,
        ADLogin,
        password,
        passwordSalt,
        profilePhotoDocumentID,
        createdEmployeeID: currentEmployeeID,
      }, { transaction });
      await transaction.commit();
      return employee;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async update({
    employeeID,
    fullNameEn,
    fullNameAr,
    userType,
    userPrivileges,
    email,
    mobile,
    militaryNumber,
    ADLogin,
    password,
    profilePhoto,
    currentEmployeeID,
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const employee = await Models.Employee.findOne({ where: { employeeID }, transaction });
      if (profilePhoto && profilePhoto.buffer) {
        // delte existing document
        await Models.Document.destroy({ where: { documentID: employee.profilePhotoDocumentID }, transaction });
        const documents = {
          title: profilePhoto.fieldname,
          fileName: profilePhoto.originalname,
          fileType: profilePhoto.mimetype,
          data: profilePhoto.buffer,
          documentCreatedemployeeID: currentEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        employee.profilePhotoDocumentID = docResp.documentID;
      }
      employee.ADLogin = !!(ADLogin);
      if (password) {
        const { passwordSalt, passwordHash } = Utils.crypto.getHashSalt(password);
        employee.password = passwordHash;
        employee.passwordSalt = passwordSalt;
      }
      employee.fullNameEn = fullNameEn;
      employee.fullNameAr = fullNameAr;
      employee.userType = userType;
      employee.userPrivileges = userPrivileges;
      employee.email = email;
      employee.mobile = mobile;
      employee.militaryNumber = militaryNumber;
      employee.updatedEmployeeID = currentEmployeeID;
      employee.updatedOn = Date.now();
      await employee.save({ transaction });
      await transaction.commit();
      return employee;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  //insert from api
  async insertAPI({
    fullNameEn,
    userName,
    email,
    mobile,
    militaryNumber,
    password,
  }) {
    let transaction;
    try {
      console.log(fullNameEn)
      transaction = await Models.sequelize.transaction();
      const { passwordSalt, passwordHash } = Utils.crypto.getHashSalt(password);
      password = passwordHash;
      const employee = await Models.Employee.create({
        fullNameEn,
        fullNameAr:fullNameEn,
        userName,
        userType:'USER',
        email,
        mobile,
        militaryNumber,
        ADLogin:false,
        password,
        passwordSalt,
        createdEmployeeID: 1,
      }, { transaction });
      await transaction.commit();
      return employee;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }
  /* UserName checking Function */
  async checkUserName(userName, employeeID = null) {
    try {
      let where;
      if (employeeID) where = { userName, employeeID: { [Op.ne]: employeeID } };
      else where = { userName };
      const user = await Models.Employee.findOne({ where, attributes: ['userName', 'employeeID'] });
      if (user && user.userName === userName) return true;
      return false;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }
  
  async changeStatus(employeeID) {
    try {
      const data = await Models.Employee.findOne({
        where: { employeeID },
        attributes: ['employeeID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async delete(employeeID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Employee.findOne({
        where: { employeeID },
        attributes: ['employeeID', 'profilePhotoDocumentID'],
        transaction,
      });
      await Models.Document.destroy({ where: { documentID: data.profilePhotoDocumentID }, transaction });
      await data.destroy({ transaction });
      await transaction.commit();
      return (data);
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e);
    }
  }

  async trash(employeeID, userDeletedemployeeID) {
    try {
      const resData = await Models.Employee.findOne({
        where: { employeeID },
        attributes: ['employeeID', 'deleted'],
      });
      resData.deleted = !resData.deleted;
      if (resData.deleted) {
        resData.userDeletedemployeeID = userDeletedemployeeID;
        resData.deletedOn = Date.now();
      } else {
        resData.userDeletedemployeeID = null;
        resData.deletedOn = null;
      }
      await resData.save();
      return (resData);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

};
