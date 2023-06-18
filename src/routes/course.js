const { Router } = require('express');
const route = Router();
// const { v2: { logger } } = require('psa-module');
const i18n = require('i18n');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const _ = require('lodash');
const activeDirectory = require('activedirectory');
const appConfig = require('../config');
const breadcrumbs = require('../utilities/breadcrumbs');
const { gatekeeper } = require('../middlewares/index');
const logger = require('../modules/logger');
const Utils = require('../utilities');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ApplicationError,
} = require('../modules/error');

const CourseService = require('../services/course');
const CourseCategoryService = require('../services/courseCategory');
const CourseDepartmentService = require('../services/courseDepartment');
const DepartmentService = require('../services/department');
const EmployeeService = require('../services/employee');
const { log } = require('console');
const course = require('../models/course');

const moduleName = 'Course';

module.exports = (app) => {
  app.use('/course', route);
  const courseService = new CourseService();
  const courseCategoryService = new CourseCategoryService();
  const courseDepartmentService = new CourseDepartmentService();
  const departmentService = new DepartmentService();
  const employeeService = new EmployeeService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('course/list', data);
        }
        const data = await courseService.get({
          req,
          deleted: false,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Deleted'),
          };
          return res.render('course/list', data);
        }
        const data = await courseService.get({
          req,
          deleted: true,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/',
    upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        let dateRange = req.body.dateRange.split(" - ");
        req.body.startDate = new Date(dateRange[0])
        req.body.endDate = new Date(dateRange[1])
         const data = await courseService.getOne(req.body.courseID);
        if (data) {
          const resData = await courseService.update({
            ...req.body,
            logo: _.find(req.files, { fieldname: 'logo' }),
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send({ success: true, courseID: resData.courseID });
        }
        const resData = await courseService.insert({
          ...req.body,
          logo: _.find(req.files, { fieldname: 'logo' }),
          createdEmployeeID: req.Employee.employeeID,
        });
        return res.send({ success: true, courseID: resData.courseID });
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/form',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        let courseDepartment = await courseDepartmentService.getAll()
        const data = {
          title: req.__('Course'),
          breadcrumb: breadcrumbs.init(__filename, moduleName).add('form'),
          mode: 'add',
          bgImage: `${appConfig.BASE_URL}dist/assets/media/psa.png`,
          courseCategory: await courseCategoryService.getAll(),
          courseDepartment: courseDepartment.rows,
          data:{startDate:new Date(),endDate:new Date(),courseType:'internal'}
        };
        res.render('course/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        let courseDepartment = await courseDepartmentService.getAll()
        const data = {
          title: req.__('Course'),
          breadcrumb: breadcrumbs.init(__filename, moduleName).add('form'),
          mode: 'edit',
          courseCategory: await courseCategoryService.getAll(),
          courseDepartment: courseDepartment.rows,
        };
        data.data = await courseService.getOne(req.params.courseID);
        if (data.data) {
          if (data.data.courseDocumentID) 
            data.bgImage = `${appConfig.BASE_URL}course/document/${req.params.courseID}`;
          else 
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          data.attachments = await courseService.getDocuments(data.data.courseID)
          res.render('course/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseService.getOne(req.params.courseID);

        // console.log(data);
        if (data.data) {
          if (data.data.courseDocumentID) 
            data.bgImage = `${appConfig.BASE_URL}course/document/${req.params.courseID}`;
          else 
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          return res.render('course/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/enrolledEmployeeList',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseService.getOneCourseWithEmployee(req.params.courseID);
        //console.log(data.data)
        if (data.data) {
          return res.render('course/enrolledEmployeeList', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/enrolledEmployeeForm',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        return res.render('course/enrolledEmployeeForm', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/getEmployees',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.getForEnroll({
          courseID:req.params.courseID,
          req,
          deleted: false,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/getEnrolledEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.getEmployees({
          req,
          courseID:req.params.courseID,
          isHeEnrolled:true,
          isOnWaitingList:false,
          rejected:false,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/getWaitingListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.getEmployees({
          req,
          courseID:req.params.courseID,
          isHeEnrolled:false,
          isOnWaitingList:true,
          rejected:false,
        });
        //console.log(req.params.courseID)
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/getRequestListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.getEmployees({
          req,
          courseID:req.params.courseID,
          isHeEnrolled:false,
          isOnWaitingList:false,
          rejected:false,
        });
        //console.log(req.params.courseID)
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/getRjectedtListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.getEmployees({
          req,
          courseID:req.params.courseID,
          isHeEnrolled:false,
          isOnWaitingList:false,
          rejected:true,
        });
        //console.log(req.params.courseID)
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:enrolledEmployeeID/employeeView',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseService.getOneEmployee(req.params.enrolledEmployeeID);
        // console.log(data);
        if (data.data) {
          data.bgImage = Utils.general.nameToIcon(data.data.employee, req.language);
          data.data.requested = (data.data.isHeEnrolled === false && data.data.isOnWaitingList === false && data.data.rejected === false)?true:false
          return res.render('course/employeeView', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/enrolledEmployeeAdd',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const resData = await courseService.enrollEmployee({
          ...req.body,
          createdEmployeeID: req.Employee.employeeID,
        });
        res.send(true)
      } catch (e) {
        res.send(false)
        //next(e);
      }
    },
  );

  route.post(
    '/enrolledEmployeeRemove',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const resData = await courseService.removeEmployee({
          ...req.body,
          //createdEmployeeID: req.Employee.employeeID,
        });
        res.send(true)
      } catch (e) {
        res.send(false)
        //next(e);
      }
    },
  );

  route.post(
    '/moveEmployee',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const resData = await courseService.moveEmployee({
          ...req.body,
          //createdEmployeeID: req.Employee.employeeID,
        });
        res.send(true)
      } catch (e) {
        res.send(false)
        //next(e);
      }
    },
  );

  route.get(
    '/:documentID/documentViewModal',
    async (req, res, next) => {
      try {
        const data = { layout: null };

        data.data = await courseService.getDocument(req.params.documentID);
        // console.log(data);
        // console.log(document.productImage.fileType);
        if (data.data) {
          return res.render('course/viewDoc', data);
        }
        return next(new Error(404));
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/addAttachemnts/:courseID',
    upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        // console.log('course id is ', req.params.courseID);
        // console.log('files ', req.files[0]);
        if(!req.params.courseID || req.params.courseID == 0)
          return res.send({success:false,message:req.__('Please save the course before adding any documents.')})
        else if(!req.files[0] || req.files[0].mimetype !== 'application/pdf')
          return res.send({success:false,message:req.__('Only PDF format is supported for uploads. Please make sure to upload files in the PDF format.')})
        const documentID = await courseService.addDocument(req.files[0], req.params.courseID);
        return res.send({ success: true, documentID });
      } catch (e) {
        res.send({ success: false, message: e.message });
        next(e);
      }
    },
  );
  
  route.post(
    '/removeAttachemnts',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        await courseService.removeDocument(req.body.documentID);
        return res.send({ success: true });
      } catch (e) {
        res.send({ success: false, message: e.message });
        next(e);
      }
    },
  );



  route.get(
    '/:courseID/status',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.changeStatus(req.params.courseID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.trash(req.params.courseID, req.Employee.courseID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/delete',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseService.delete(req.params.courseID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  

  route.get(
    '/:documentID/document',
    async (req, res, next) => {
      try {
        const document = await courseService.getDocument(req.params.documentID);
        // console.log(document.productImage.fileType);
        if (document) {
          res.setHeader('Content-Type', document.fileType);
          // res.setHeader('Content-disposition', 'attachment; filename=' + data.Document.FileName);
          return res.send(Buffer.from(document.data, 'utf8'));
        }
        return next(new Error(404));
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/document/:courseID',
    async (req, res, next) => {
      try {
        const document = await courseService.getImage(req.params.courseID);
        // console.log(document.profilePhoto.data);
        if (document && document.logo) {
          res.setHeader('Content-Type', document.logo.fileType);
          // res.setHeader('Content-disposition', 'attachment; filename=' + data.Document.FileName);
          return res.send(Buffer.from(document.logo.data, 'utf8'));
        }
        return next(new Error(404));
      } catch (e) {
        next(e);
      }
    },
  );

  

  

  return route;
};
