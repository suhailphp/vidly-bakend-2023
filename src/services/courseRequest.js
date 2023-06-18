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
} = require('../models/index');

const Models = require('../models');
const logger = require('../modules/logger');
const Utils = require('../utilities');
const pagination = require('../utilities/pagination');
const { log } = require('console');
const dateformat = require('dateformat');

module.exports = class EmployeeService {
  /* get Function */
  async get({
    req,
    active = true,
    rejected = false,
    transferred = false,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const include = [
        {
          model:Models.Department,
          as:'department',
          require:false,
          attributes:['nameAr','nameEn']
        }
      ]
      const resData = await Models.CourseRequest.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { active,deleted,rejected,transferred },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['nameAr', 'nameEn', ],
            allowedSortColumns: ['NameEn', 'NameAr',  'createdOn','rejectedOn',
            // {
            //   key: 'courseCategory',
            //   model: { model: Models.CourseCategory, as: 'courseCategory' },
            //   field: `name${req.language === 'en' ? 'En' : 'Ar'}`,
            // },
          ],
          }),
          include
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }
  
  async getOne(courseRequestID) {
    try {
      const include = [
        {
          model: Models.Employee,
          required: false,
          as: 'HRApprovedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.Employee,
          required: false,
          as: 'initApprovedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.Employee,
          required: false,
          as: 'finalApprovedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model: Models.Employee,
          required: false,
          as: 'rejectedBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
        {
          model:Models.Department,
          as:'department',
          require:false,
          attributes:['nameAr','nameEn']
        }
       
      ];
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        include,
      });
      //console.log(data);
      return (data);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOneEmployee(employeeID) {
    try {
      const include = [
        {
          model: Models.Employee,
          required: false,
          as: 'createdBy',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID', 'profilePhotoDocumentID'],
        },
      ];
      const employee = await Models.Employee.findOne({
        where: { employeeID },
        include,
      });
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOneCourseWithEmployee(courseRequestID) {
    try {
      const include = [
        {
          model: Models.Employee,
          required: false,
          as: 'employee',
          through:'RequestedEmployee',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID','militaryNumber', 'profilePhotoDocumentID'],
        },
       
      ];
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        include,
      });
      return (data);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async insert({
    nameEn,
    nameAr,
    description,
    createdEmployeeID,
    departmentID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseRequest.create({
        nameEn,
        nameAr,
        description,
        createdEmployeeID,
        departmentID
      }, { transaction });
      await transaction.commit();
      return data;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async update({
    courseRequestID,
    nameEn,
    nameAr,
    description,
    updatedEmployeeID,
    departmentID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseRequest.findOne({ where: { courseRequestID }, transaction });
      
      data.nameEn = nameEn;
      data.nameAr = nameAr;
      data.description = description;
      data.updatedEmployeeID = updatedEmployeeID;
      data.updatedOn = Date.now();
      data.departmentID = departmentID
      await data.save({ transaction });
      await transaction.commit();
      return data;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  /* PostFunction */
  async enrollEmployee({
    employeeID,
    courseRequestID,
    createdEmployeeID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const CourseRequest = await Models.CourseRequest.findByPk(courseRequestID,{transaction}); 
      //console.log(CourseRequest)
      const Employee = await Models.Employee.findByPk(employeeID,{transaction}); 
      const RequestedEmployee = await Models.RequestedEmployee.create({
        createdEmployeeID,
        // employeeID,
        // courseRequestID,
      }, { transaction });
      await RequestedEmployee.setCourseRequest(CourseRequest,{transaction});
      await RequestedEmployee.setEmployee(Employee,{transaction});
      //await RequestedEmployee.setCourse(Course,{transaction})
      await transaction.commit();
      return true;
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async getForEnroll({
    courseRequestID,
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const Course = await Models.CourseRequest.findOne({
        where:{courseRequestID},
        attributes:['courseRequestID'],
        include:[
          {
            attributes:['employeeID'],
            model:Models.Employee,
            as:'employee'
          }
        ]
      }); 
      let enrolledEmployeeIDs = [0]
      if(Course.employee && Course.employee.length > 0){
        for(let i=0;i<Course.employee.length;i++){
          enrolledEmployeeIDs.push(Course.employee[i].employeeID)
        }
      }
      const resData = await Models.Employee.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { 
              deleted,
              [Op.not]: {
                employeeID: enrolledEmployeeIDs,
              },
            },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['fullNameAr', 'fullNameEn', 'userName', 'email', 'militaryNumber'],
            allowedSortColumns: ['fullNameEn', 'fullNameAr',  'email','militaryNumber'],
          }),
        },
      );

      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }
  
  async getEmployees({
    req,
    courseRequestID,
  }) {
    try {
      logger.silly('Getting user db record');
      const resData = await Models.RequestedEmployee.findAndCountAll(
        {
          ...pagination.init(req, {
            where:{courseRequestID},
            attributes:['courseRequestID','requestedEmployeeID'],
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['$employee.fullNameAr$', '$employee.fullNameEn$', '$employee.email$', '$employee.mobile$','$employee.militaryNumber$'],
          }),
          include:[
            {
              attributes:['employeeID','fullNameAr', 'fullNameEn', 'mobile', 'email', 'militaryNumber','profilePhotoDocumentID']
  ,           model:Models.Employee,
              as:'employee'
            },
          ],
        },
      );
      return pagination.res(req, resData);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOneEmployee(requestedEmployeeID) {
    try {
      const include = [
        {
          attributes:['employeeID','fullNameAr', 'fullNameEn', 'mobile', 'email', 'militaryNumber','profilePhotoDocumentID','userName','userType'],           
          model:Models.Employee,
          as:'employee',
          include:[
            {
              model: Models.Department,
              required: false,
              as: 'department',
              attributes: ['nameAr', 'nameEn', ],
            },
            {
              model: Models.CourseLevel,
              required: false,
              as: 'courseLevel',
              attributes: ['nameAr', 'nameEn', ],
            },
          ]
        },
      ];
      const employee = await Models.RequestedEmployee.findOne({
        where: { requestedEmployeeID },
        include,
      });
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async removeEmployee({
    requestedEmployeeID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const RequestedEmployee = await Models.RequestedEmployee.findOne({
        where:{requestedEmployeeID}
      }, { transaction });
      await RequestedEmployee.destroy({transaction})
      await transaction.commit();
      return true;
    } catch (e) {
      //console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async approval(courseRequestID,employeeID,action = '') {
    try {
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        attributes: ['courseRequestID', 'HRApproved','initApproved','finalApproved'],
      });
      if(action && action == 'HRApprove'){
        data.HRApproved = true;
        data.HRApprovedEmployeeID = employeeID;
        data.HRApprovedOn = Date.now();
      }
      else if(action && action == 'initApprove'){
        data.initApproved = true;
        data.initApprovedEmployeeID = employeeID;
        data.initApprovedOn = Date.now();
      }
      else if(action && action == 'finalApprove'){
        data.finalApproved = true;
        data.finalApprovedEmployeeID = employeeID;
        data.finalApprovedOn = Date.now();
      }
     
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }
  
  async rejection(courseRequestID,employeeID) {
    try {
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        attributes: ['courseRequestID', 'active','rejected','finalApproved'],
      });
      data.active = false;
      data.finalApproved = false;
      data.finalApprovedEmployeeID = null;
      data.finalApprovedOn = null;
      data.rejected = true;
      data.rejectedEmployeeID = employeeID;
      data.rejectedOn = Date.now();
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }
  async changeStatus(courseRequestID) {
    try {
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        attributes: ['courseRequestID', 'active'],
      });
      data.active = !data.active;
  
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(courseRequestID, userDeletedcourseRequestID) {
    try {
      const resData = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        attributes: ['courseRequestID', 'deleted'],
      });
      resData.deleted = !resData.deleted;
      if (resData.deleted) {
        resData.userDeletedcourseRequestID = userDeletedcourseRequestID;
        resData.deletedOn = Date.now();
      } else {
        resData.userDeletedcourseRequestID = null;
        resData.deletedOn = null;
      }
      await resData.save();
      return (resData);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async delete(courseRequestID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.CourseRequest.findOne({
        where: { courseRequestID },
        attributes: ['courseRequestID', 'courseDocumentID'],
        transaction,
      });
      await Models.Document.destroy({ where: { documentID: data.courseDocumentID }, transaction });
      await data.destroy({ transaction });
      await transaction.commit();
      return (data);
    } catch (e) {
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e);
    }
  }
};
