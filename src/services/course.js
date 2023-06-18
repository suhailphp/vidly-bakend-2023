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
const dateformat = require('dateformat');

module.exports = class EmployeeService {
  /* get Function */
  async get({
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');
      const include = [
        // {
        //   model:Models.CourseCategory,
        //   as:'courseCategory',
        //   require:false,
        //   attributes:['nameAr','nameEn']
        // },
        // {
        //   model:Models.CourseCategory,
        //   as:'courseCategory',
        //   require:false,
        //   attributes:['nameAr','nameEn']
        // }
      ]
      const resData = await Models.Course.findAndCountAll(
        {
          ...pagination.init(req, {
            where: { deleted },
            defaultSort: ['createdOn', 'DESC'],
            whereLike: ['nameAr', 'nameEn', 'quota', 'amount'],
            allowedSortColumns: ['fullNameEn', 'fullNameAr', 'quota','isInternalCourse', 'amount', 'createdOn',
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
  
  async getOne(courseID) {
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
          model: Models.CourseCategory,
          required: false,
          as: 'courseCategory',
          attributes: ['nameAr', 'nameEn', ],
        },
        {
          model: Models.CourseDepartment,
          required: false,
          as: 'courseDepartment',
          attributes: ['nameAr', 'nameEn', ],
        },

      ];
      const data = await Models.Course.findOne({
        where: { courseID },
        include,
      });
      //console.log(data);
      return (data);
    } catch (e) {
      //console.log('error from view modal',e)
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
      // console.log(employee);
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getOneCourseWithEmployee(courseID) {
    try {
      const include = [
        {
          model: Models.Employee,
          required: false,
          as: 'employee',
          through:'EnrolledEmployee',
          attributes: ['fullNameAr', 'fullNameEn', 'employeeID','militaryNumber', 'profilePhotoDocumentID'],
        },
       
      ];
      const data = await Models.Course.findOne({
        where: { courseID },
        include,
      });
      //console.log(data);
      return (data);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getCounts(employeeID){
    try{
      const today = new Date();
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Extracting date part

      let totalCourseCount = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
      })
      let totalActiveCourse = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
        include:[
          {
            model:Models.Course,
            where:{
              startDate: { [Op.lte]: currentDate }, 
              endDate: { [Op.gte]: currentDate }, 
            }
          }
        ]
      })

      let totalCompletedCourse = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
        include:[
          {
            model:Models.Course,
            where:{
              endDate: { [Op.lte]: currentDate }, 
            }
          }
        ]
      })

      let totalUpComingCourse = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
        include:[
          {
            model:Models.Course,
            where:{
              startDate: { [Op.gte]: currentDate }, 
            }
          }
        ]
      })

      let activeInternalCourse = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
        include:[
          {
            model:Models.Course,
            where:{
              courseType: 'internal', 
              startDate: { [Op.lte]: currentDate }, 
              endDate: { [Op.gte]: currentDate }, 
            }
          }
        ]
      })

      let activeExternallCourse = await Models.EnrolledEmployee.count({
        where:{employeeID,isHeEnrolled:true},
        include:[
          {
            model:Models.Course,
            where:{
              courseType: 'extenral', 
              startDate: { [Op.lte]: currentDate }, 
              endDate: { [Op.gte]: currentDate }, 
            }
          }
        ]
      })

      let completedPercentage = (totalCourseCount&&totalCompletedCourse)?Math.round((totalCompletedCourse/totalCourseCount)*100):0;
      let completedPercentageStyle = 'success'
      if(completedPercentage <=30){
        completedPercentageStyle = 'danger'
      }
      else if(completedPercentage <=70){
        completedPercentageStyle = 'warning'
      }
      
      return {
        totalCourseCount,totalActiveCourse,
        totalCompletedCourse,totalUpComingCourse,
        activeInternalCourse,activeExternallCourse,
        completedPercentage,completedPercentageStyle
      }
    }
    catch(e){
      throw new ApplicationError(e.message);
    }
    
  }

  async getDayCourse(employeeID,today,weekName){
    try{
      //const today = daysArray.date;
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Extracting date part

      let data = await Models.EnrolledEmployee.findAll({
        where:{employeeID,isHeEnrolled:true},
        attributes:['employeeID'],
        include:[
          {
            model:Models.Course,
            attributes:['courseID','nameAr','nameEn','location','startDate','endDate','courseDocumentID'],
            where:{
              startDate: { [Op.lte]: currentDate }, 
              endDate: { [Op.gte]: currentDate }, 
              weekdays: {[Op.like]: `%${weekName}%`},
            },
          },
        ],
        order: [[Models.Course,'startTime', 'ASC']],
      })

      return data
    }
    catch(e){
      console.log(e)
      throw new ApplicationError(e.message);
    }
    
  }
  async getActive(courseType,employeeID) {
    try {

       const courses = await Models.EnrolledEmployee.findAll({
        attributes:['courseID','isHeEnrolled'],
        where:{employeeID},
        include:[
          {
            model:Models.Course,
            attributes:['nameAr','nameEn','location','startDate','endDate','courseDocumentID'],
            where: { active: true, deleted: false,courseType },
            include:[
              {
                model:Models.Employee,
                as:'employee',
                //through:'EnrolledEmployee',
                through: {
                  model: Models.EnrolledEmployee,
                  where: {
                    isHeEnrolled: true, // Apply the desired WHERE condition here
                  },
                },
                attributes: ['fullNameAr', 'fullNameEn', 'employeeID','militaryNumber', 'profilePhotoDocumentID'],
              }
            ]
          }
        ]
      });
      return (courses);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getActiveByCD(courseDepartmentID,employeeID) {
    try {
      // const course = await Models.Course.findAndCountAll({
      //   where: { active: true, deleted: false,courseType:'external',courseDepartmentID },
      // });
      // return (course);
      const courses = await Models.EnrolledEmployee.findAll({
        attributes:['courseID','isHeEnrolled'],
        where:{employeeID},
        include:[
          {
            model:Models.Course,
            attributes:['nameAr','nameEn','location','startDate','endDate','courseDocumentID'],
            where: { active: true, deleted: false,courseType,courseDepartmentID },
            include:[
              {
                model:Models.Employee,
                as:'employee',
                //through:'EnrolledEmployee',
                through: 'EnrolledEmployee',
                //limit:5,
                attributes: ['fullNameAr', 'fullNameEn', 'employeeID','militaryNumber', 'profilePhotoDocumentID'], // Exclude join table attributes from the result
              }
            ]
          }
        ]
      });
      return (courses);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }


  async getImage(courseID) {
    try {
      const document = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID'],
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
    startDate,
    endDate,
    location,
    weekdays,
    courseType,
    quota,
    waitingList,
    openEnrollment,
    amount,
    description,
    courseDepartmentID,
    courseCategoryID,
    createdEmployeeID,
    logo
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      let courseDocumentID = null;
      if (logo && logo.buffer) {
        const documents = {
          title: logo.fieldname,
          fileName: logo.originalname,
          fileType: logo.mimetype,
          data: logo.buffer,
          documentCreatedcourseID: createdEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        courseDocumentID = docResp.documentID;
      }

      const data = await Models.Course.create({
        nameEn,
        nameAr,
        startDate:startDate,
        endDate:endDate,
        startTime:dateformat(startDate, ' HH:MM:ss'),
        endTime:dateformat(endDate, ' HH:MM:ss'),
        location,
        quota:parseInt(quota),
        waitingList:parseInt(waitingList),
        openEnrollment:!!(openEnrollment),
        amount:parseFloat(amount),
        courseDepartmentID:(courseDepartmentID)?courseDepartmentID:null,
        courseCategoryID:(courseCategoryID)?courseCategoryID:null,
        weekdays,
        courseType,
        description,
        createdEmployeeID,
        courseDocumentID
      }, { transaction });
      await transaction.commit();
      return data;
    } catch (e) {
      console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async update({
    courseID,
    nameEn,
    nameAr,
    startDate,
    endDate,
    location,
    weekdays,
    courseType,
    quota,
    waitingList,
    openEnrollment,
    amount,
    description,
    courseDepartmentID,
    courseCategoryID,
    updatedEmployeeID,
    logo
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Course.findOne({ where: { courseID }, transaction });
      if (logo && logo.buffer) {
        // delte existing document
        await Models.Document.destroy({ where: { documentID: data.courseDocumentID }, transaction });
        const documents = {
          title: logo.fieldname,
          fileName: logo.originalname,
          fileType: logo.mimetype,
          data: logo.buffer,
          documentCreatedcourseID: updatedEmployeeID,
        };
        const docResp = await Models.Document.create({ ...documents }, { transaction });
        data.courseDocumentID = docResp.documentID;
      }
      data.nameEn = nameEn;
      data.nameAr = nameAr;
      data.startDate = startDate;
      data.endDate = endDate;
      data.startTime = dateformat(startDate, ' HH:MM:ss');
      data.endTime = dateformat(endDate, ' HH:MM:ss');
      data.location = location;
      data.weekdays = weekdays;
      data.courseType = courseType;
      data.quota = parseInt(quota);
      data.waitingList = parseInt(waitingList);
      data.openEnrollment = !!(openEnrollment);
      data.amount = parseFloat(amount);
      data.description = description;
      data.courseDepartmentID = (courseDepartmentID)?courseDepartmentID:null;
      data.courseCategoryID = (courseCategoryID)?courseCategoryID:null;
      data.updatedEmployeeID = updatedEmployeeID;
      data.updatedOn = Date.now();
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
    courseID,
    createdEmployeeID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const Course = await Models.Course.findByPk(courseID,{transaction}); 
      const Employee = await Models.Employee.findByPk(employeeID,{transaction}); 
      const EnrolledEmployee = await Models.EnrolledEmployee.create({
        createdEmployeeID,
        // employeeID,
        // courseID,
      }, { transaction });
      await EnrolledEmployee.setCourse(Course,{transaction});
      await EnrolledEmployee.setEmployee(Employee,{transaction});
      //await EnrolledEmployee.setCourse(Course,{transaction})
      await transaction.commit();
      return true;
    } catch (e) {
      //console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async removeEmployee({
    enrolledEmployeeID
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      //const Course = await Models.Course.findByPk(courseID,{transaction}); 
      //const Employee = await Models.Employee.findByPk(employeeID,{transaction}); 
      const EnrolledEmployee = await Models.EnrolledEmployee.findOne({
        where:{enrolledEmployeeID}
      }, { transaction });
      //console.log(EnrolledEmployee)
      //await EnrolledEmployee.removeCourse(Course,{transaction});
      //await EnrolledEmployee.removeEmployee(Employee,{transaction});
      await EnrolledEmployee.destroy({transaction})
      await transaction.commit();
      return true;
    } catch (e) {
      //console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async moveEmployee({
    enrolledEmployeeID,
    moveTo
  }) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();

      const EnrolledEmployee = await Models.EnrolledEmployee.findOne({
        where:{enrolledEmployeeID:enrolledEmployeeID}
      }, { transaction });
      if(moveTo === 'enroll'){
        EnrolledEmployee.isHeEnrolled = true
        EnrolledEmployee.isOnWaitingList = false
        EnrolledEmployee.rejected = false
      }
      else if(moveTo === 'waiting'){
        EnrolledEmployee.isHeEnrolled = false
        EnrolledEmployee.isOnWaitingList = true
        EnrolledEmployee.rejected = false
      }
      else if(moveTo === 'reject'){
        EnrolledEmployee.isHeEnrolled = false
        EnrolledEmployee.isOnWaitingList = false
        EnrolledEmployee.rejected = true
      }
      else {
        EnrolledEmployee.isHeEnrolled = false
        EnrolledEmployee.isOnWaitingList = false
        EnrolledEmployee.rejected = false
      }
      
      await EnrolledEmployee.save({transaction})
      await transaction.commit();
      return true;
    } catch (e) {
      //console.log(e)
      if (transaction) await transaction.rollback();
      throw new ApplicationError(e.message);
    }
  }

  async getForEnroll({
    courseID,
    req,
    deleted = false,
  }) {
    try {
      logger.silly('Getting user db record');

      const Course = await Models.Course.findOne({
        where:{courseID},
        attributes:['courseID'],
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
    courseID,
    isHeEnrolled,
    isOnWaitingList,
    rejected,

  }) {
    try {
      logger.silly('Getting user db record');
      const resData = await Models.EnrolledEmployee.findAndCountAll(
        {
          ...pagination.init(req, {
            where:{courseID,isHeEnrolled,isOnWaitingList,rejected},
            attributes:['courseID','enrolledEmployeeID'],
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

  async getOneEmployee(enrolledEmployeeID) {
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
      const employee = await Models.EnrolledEmployee.findOne({
        where: { enrolledEmployeeID },
        include,
      });
      // console.log(employee);
      return (employee);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }


  async changeStatus(courseID) {
    try {
      const data = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID', 'active'],
      });
      data.active = !data.active;
      await data.save();
      return (data);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async trash(courseID, userDeletedcourseID) {
    try {
      const resData = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID', 'deleted'],
      });
      resData.deleted = !resData.deleted;
      if (resData.deleted) {
        resData.userDeletedcourseID = userDeletedcourseID;
        resData.deletedOn = Date.now();
      } else {
        resData.userDeletedcourseID = null;
        resData.deletedOn = null;
      }
      await resData.save();
      return (resData);
    } catch (e) {
      throw new ApplicationError(e);
    }
  }

  async delete(courseID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const data = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID', 'courseDocumentID'],
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


  async addDocument(document, courseID) {
    let transaction;
    try {
      transaction = await Models.sequelize.transaction();
      const course = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID'],
        transaction,
      });
      // await Models.Document.destroy({ where: { title: 'messageDocument' } });
      if (!course) { throw new ApplicationError('course not found!'); }
      const Document = {
        fileName: document.originalname,
        fileType: document.mimetype,
        data: document.buffer,
        title: 'CourseDocument',
      };
      const docs = await Models.Document.create(Document, { transaction });
      // console.log(docs.documentID);
      await course.addDocument(docs, { transaction });
      await transaction.commit();
      return (docs.documentID);
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async removeDocument(documentID) {
    try {
      await Models.Document.destroy({ where: { documentID } });
      return true;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getDocument(documentID) {
    try {
      const document = await Models.Document.findOne({
        where: { documentID },
      });
      return document;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

  async getDocuments(courseID) {
    try {
      const course = await Models.Course.findOne({
        where: { courseID },
        attributes: ['courseID'],
        include: [
          {
            model: Models.Document,
            as: 'Documents',
            attributes: ['fileName', 'fileType', 'documentID'],
          },
        ],
      });
      return course.Documents;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }

};
