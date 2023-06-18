const { Router } = require('express');
const route = Router();
// const { v2: { logger } } = require('psa-module');
const i18n = require('i18n');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const _ = require('lodash');
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

const CourseRequestService = require('../services/courseRequest');
const CourseCategoryService = require('../services/courseCategory');
const CourseDepartmentService = require('../services/courseDepartment');
const { log } = require('console');

const moduleName = 'Course Request';

module.exports = (app) => {
  app.use('/courseRequest', route);
  const courseRequestService = new CourseRequestService();
  const courseCategoryService = new CourseCategoryService();
  const courseDepartmentService = new CourseDepartmentService();

  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER']),
    gatekeeper.checkUserPrivilege('VIEW'),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course Requests'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('courseRequest/list', data);
        }
        const data = await courseRequestService.get({
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
            title: req.__('Deleted courese requests'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('trash'),
          };
          return res.render('courseRequest/list', data);
        }
        const data = await courseRequestService.get({
          req,
          deleted: true,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/transferred',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Transferred coures requests'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('transferred'),
          };
          return res.render('courseRequest/list', data);
        }
        const data = await courseRequestService.get({
          req,
          transferred:true,
          active: false,
          deleted: false,
        });

        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/rejected',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Rejected course requests'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('rejected'),
          };
          return res.render('courseRequest/rejected', data);
        }
        const data = await courseRequestService.get({
          req,
          rejected:true,
          active: false,
          deleted: false,
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
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
         const data = await courseRequestService.getOne(req.body.courseRequestID);
        if (data) {
          const resData = await courseRequestService.update({
            ...req.body,
            updatedEmployeeID: req.Employee.employeeID,
            departmentID: req.Employee.departmentID,
          });
          return res.send({ success: true, courseRequestID: resData.courseRequestID });
        }
        const resData = await courseRequestService.insert({
          ...req.body,
          createdEmployeeID: req.Employee.employeeID,
          departmentID: req.Employee.departmentID,
        });
        return res.send({ success: true, courseRequestID: resData.courseRequestID });
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/form',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        let courseDepartment = await courseDepartmentService.getAll()
        const data = {
          title: req.__('Course Request'),
          breadcrumb: breadcrumbs.init(__filename, moduleName).add('form'),
          mode: 'add',
          bgImage: `${appConfig.BASE_URL}dist/assets/media/psa.png`,
          courseCategory: await courseCategoryService.getAll(),
          courseDepartment: courseDepartment.rows,
          data:{startDate:new Date(),endDate:new Date(),courseType:'internal'}
        };
    
        res.render('courseRequest/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        let courseDepartment = await courseDepartmentService.getAll()
        const data = {
          title: req.__('Course Request'),
          breadcrumb: breadcrumbs.init(__filename, moduleName).add('form'),
          mode: 'edit',
          courseCategory: await courseCategoryService.getAll(),
          courseDepartment: courseDepartment.rows,
        };
        data.data = await courseRequestService.getOne(req.params.courseRequestID);
        if (data.data) {
          res.render('courseRequest/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseRequestService.getOne(req.params.courseRequestID);

        if (data.data) {
          if (data.data.courseDocumentID) 
            data.bgImage = `${appConfig.BASE_URL}course/document/${req.params.courseRequestID}`;
          else 
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          return res.render('courseRequest/view', data);
        } res.send(false);
      } catch (e) {
        //console.log('error from view modal',e)
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/enrolledEmployeeList',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseRequestService.getOneCourseWithEmployee(req.params.courseRequestID);
        if (data.data) {
          return res.render('courseRequest/enrolledEmployeeList', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/enrolledEmployeeForm',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        return res.render('courseRequest/enrolledEmployeeForm', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/getEmployees',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.getForEnroll({
          courseRequestID:req.params.courseRequestID,
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
    '/:courseRequestID/getEnrolledEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.getEmployees({
          req,
          courseRequestID:req.params.courseRequestID,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/getWaitingListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.getEmployees({
          req,
          courseRequestID:req.params.courseRequestID,
          isHeEnrolled:false,
          isOnWaitingList:true,
          rejected:false,
        });
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/getRequestListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.getEmployees({
          req,
          courseRequestID:req.params.courseRequestID,
          isHeEnrolled:false,
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
    '/:courseRequestID/getRjectedtListEmployees',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.getEmployees({
          req,
          courseRequestID:req.params.courseRequestID,
          isHeEnrolled:false,
          isOnWaitingList:false,
          rejected:true,
        });
        //console.log(req.params.courseRequestID)
        return res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:enrolledEmployeeID/employeeView',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseRequestService.getOneEmployee(req.params.enrolledEmployeeID);
        // console.log(data);
        if (data.data) {
          data.bgImage = Utils.general.nameToIcon(data.data.employee, req.language);
          data.data.requested = (data.data.isHeEnrolled === false && data.data.isOnWaitingList === false && data.data.rejected === false)?true:false
          return res.render('courseRequest/employeeView', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/enrolledEmployeeAdd',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const resData = await courseRequestService.enrollEmployee({
          ...req.body,
          createdEmployeeID: req.Employee.employeeID,
        });
        res.send(true)
      } catch (e) {
        res.send(false)
      }
    },
  );

  route.post(
    '/enrolledEmployeeRemove',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const resData = await courseRequestService.removeEmployee({
          ...req.body,

        });
        res.send(true)
      } catch (e) {
        res.send(false)
      }
    },
  );

  route.post(
    '/moveEmployee',
    //upload.any(),
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','USER','COMPETENCY-USER']),
    async (req, res, next) => {
      try {
        const resData = await courseRequestService.moveEmployee({
          ...req.body,
          //createdEmployeeID: req.Employee.employeeID,
        });
        res.send(true)
      } catch (e) {
        res.send(false)
      }
    },
  );

  route.get(
    '/:courseRequestID/approval/:action',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.approval(req.params.courseRequestID,req.Employee.employeeID,req.params.action);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/rejection/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.rejection(req.params.courseRequestID,req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/status',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.changeStatus(req.params.courseRequestID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.trash(req.params.courseRequestID, req.Employee.courseRequestID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseRequestID/delete',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseRequestService.delete(req.params.courseRequestID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  return route;
};
