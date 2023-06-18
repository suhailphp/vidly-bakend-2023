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

const GrenreService = require('../services/genre');

const moduleName = 'genre';

module.exports = (app) => {
  app.use('/genre', route);
  const genreService = new GrenreService();

  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Genre'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('genre/list', data);
        }
        const data = await genreService.get({
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
            title: req.__('Genre Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Trash'),
          };
          return res.render('genre/list', data);
        }

         const data = await genreService.get({
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
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {


        const resData = await genreService.getOne(req.body.genreID);
        if (resData) {
          await genreService.update({
            ...req.body,
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }
        await genreService.insert({
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

        res.render('genre/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:genreID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
        };

        data.data = await genreService.getOne(req.params.genreID);
        if (data.data) {
          res.render('genre/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:genreID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await genreService.getOne(req.params.genreID);
        if (data.data) {
          return res.render('genre/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:genreID/status',
    // gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await genreService.changeStatus(req.params.genreID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:genreID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await genreService.trash(req.params.genreID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:genreID/delete',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await genreService.delete(req.params.genreID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );


  return route;
};
