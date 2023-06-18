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

const CourseDepartmentService = require('../services/courseDepartment');
const DepartmentService = require('../services/department');
const CourseLevelService = require('../services/courseLevel');
const { log } = require('console');

const moduleName = 'CourseDepartment';

module.exports = (app) => {
  app.use('/courseDepartment', route);
  const courseDepartmentService = new CourseDepartmentService();
  const departmentService = new DepartmentService();
  const courseLevelService = new CourseLevelService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course Department'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('courseDepartment/list', data);
        }

        const data = await courseDepartmentService.get({
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
            title: req.__('Course Departmen Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Deleted'),
          };
          return res.render('courseDepartment/list', data);
        }

        // console.log(req.query.order);
        const data = await courseDepartmentService.get({
          req,
          deleted: true,
        });
          // console.log(data);
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
        const data = await courseDepartmentService.getOne(req.body.courseDepartmentID);
        if(data) {
          await courseDepartmentService.update({
            ...req.body,
            logo: _.find(req.files, { fieldname: 'logo' }),
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }

        await courseDepartmentService.insert({
          ...req.body,
          logo: _.find(req.files, { fieldname: 'logo' }),
          createdEmployeeID: req.Employee.employeeID,
        });
        return res.send(true);
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
        const data = {
          layout: null,
          mode: 'add',
          bgImage: `${appConfig.BASE_URL}dist/assets/media/psa.png`,
          courseLevel: await courseLevelService.getAll(),
        };
        res.render('courseDepartment/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseDepartmenttID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
          courseLevel: await courseLevelService.getAll(),
        };
        data.data = await courseDepartmentService.getOne(req.params.courseDepartmenttID);
        if (data.data) {
          if (data.data.courseDepartmentDocumentID) {
            data.bgImage = `${appConfig.BASE_URL}courseDepartment/document/${req.params.courseDepartmenttID}`;
          } else {
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          }

          res.render('courseDepartment/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseDepartmenttID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseDepartmentService.getOne(req.params.courseDepartmenttID);
        // console.log(data);
        if (data.data) {
          if (data.data.courseDepartmentDocumentID) {
            data.bgImage = `${appConfig.BASE_URL}courseDepartment/document/${req.params.courseDepartmenttID}`;
          } else {
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          }
          return res.render('courseDepartment/view', data);
        } 
        res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseDepartmenttID/status',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseDepartmentService.changeStatus(req.params.courseDepartmenttID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseDepartmentID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseDepartmentService.trash(req.params.courseDepartmentID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseDepartmenttID/delete',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseDepartmentService.delete(req.params.courseDepartmenttID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  

  route.get(
    '/document/:courseDepartmenttID',
    async (req, res, next) => {
      try {
        const document = await courseDepartmentService.getImage(req.params.courseDepartmenttID);
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
