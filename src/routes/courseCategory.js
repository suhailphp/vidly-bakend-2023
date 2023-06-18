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

const CourseCategoryService = require('../services/courseCategory');
const CourseLevelService = require('../services/courseLevel');

const moduleName = 'courseCategory';

module.exports = (app) => {
  app.use('/courseCategory', route);
  const courseCategoryService = new CourseCategoryService();
  const courseLevelService = new CourseLevelService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course Category'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('courseCategory/list', data);
        }

        // console.log(req.query);
        const data = await courseCategoryService.get({
          query: req.query,
          deleted: false,
        });

        // console.log(data);
        return res.json({
          data: data.rows,
          draw: req.query.draw,
          recordsTotal: data.totalCount,
          recordsFiltered: data.count,
        });
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
            title: req.__('Course Category Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Trash'),
          };
          return res.render('courseCategory/list', data);
        }

        // console.log(req.query.order);
        const data = await courseCategoryService.get({
          query: req.query,
          deleted: true,
        });
          // console.log(data);
        return res.json({
          data: data.rows,
          draw: req.query.draw,
          recordsTotal: data.totalCount,
          recordsFiltered: data.count,
        });
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {


        const resData = await courseCategoryService.getOne(req.body.courseCategoryID);
        if (resData) {
          await courseCategoryService.update({
            ...req.body,
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }
        await courseCategoryService.insert({
          ...req.body,
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
          courseLevel: await courseLevelService.getAll(),
          data: { },
        };

        res.render('courseCategory/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseCategoryID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
          courseLevel: await courseLevelService.getAll(),
        };

        data.data = await courseCategoryService.getOne(req.params.courseCategoryID);
        if (data.data) {
          res.render('courseCategory/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseCategoryID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseCategoryService.getOne(req.params.courseCategoryID);
        if (data.data) {
          return res.render('courseCategory/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseCategoryID/status',
    // gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseCategoryService.changeStatus(req.params.courseCategoryID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseCategoryID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseCategoryService.trash(req.params.courseCategoryID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseCategoryID/delete',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseCategoryService.delete(req.params.courseCategoryID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

 

  return route;
};
