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

const CourseLevelService = require('../services/courseLevel');

const moduleName = 'courseLevel';

module.exports = (app) => {
  app.use('/courseLevel', route);
  const courseLevelService = new CourseLevelService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Course Level'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('courseLevel/list', data);
        }

        // console.log(req.query);
        const data = await courseLevelService.get({
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
            title: req.__('Course Level Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Trash'),
          };
          return res.render('courseLevel/list', data);
        }

        // console.log(req.query.order);
        const data = await courseLevelService.get({
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


        const resData = await courseLevelService.getOne(req.body.courseLevelID);
        if (resData) {
          await courseLevelService.update({
            ...req.body,
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }
        await courseLevelService.insert({
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
          data: { },
        };

        res.render('courseLevel/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseLevelID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
        };

        data.data = await courseLevelService.getOne(req.params.courseLevelID);
        if (data.data) {
          res.render('courseLevel/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseLevelID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseLevelService.getOne(req.params.courseLevelID);
        if (data.data) {
          return res.render('courseLevel/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseLevelID/status',
    // gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseLevelService.changeStatus(req.params.courseLevelID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseLevelID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseLevelService.trash(req.params.courseLevelID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseLevelID/delete',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await courseLevelService.delete(req.params.courseLevelID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );


  return route;
};
