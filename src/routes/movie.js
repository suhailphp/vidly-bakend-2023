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
const MovieService = require('../services/movie');
const { log } = require('console');

const moduleName = 'movie';

module.exports = (app) => {
  app.use('/movie', route);
  const genreService = new GrenreService();
  const movieService = new MovieService();

   //here is the code for api

  route.get(
    '/api/',
    async (req,res,next)=>{
      res.header("Access-Control-Allow-Origin", "*");
      const data = await movieService.getAll()
      res.send(data)
    }
  )

   route.delete(
    '/api/:movieID',
    async (req,res,next)=>{
      res.header("Access-Control-Allow-Origin", "*");
       try {
        await movieService.trash(req.params.movieID);
        res.send(true);
      } catch (e) {
        return res.status(404).send("The Movie with the given ID was not found.");
      }
    }
  )

  //end the code for api

  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: req.__('Movie'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('movie/list', data);
        }
        const data = await movieService.get({
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
            title: req.__('Movie Trash list'),
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Trash'),
          };
          return res.render('movie/list', data);
        }

         const data = await movieService.get({
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


        const resData = await movieService.getOne(req.body.movieID);
        if (resData) {
          await movieService.update({
            ...req.body,
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }
        await movieService.insert({
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
          genres:await genreService.getAll()
        };

        res.render('movie/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:movieID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
          genres:await genreService.getAll()
        };

        data.data = await movieService.getOne(req.params.movieID);
        if (data.data) {
          res.render('movie/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:movieID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await movieService.getOne(req.params.movieID);
        if (data.data) {
          return res.render('movie/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:movieID/status',
    // gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await movieService.changeStatus(req.params.movieID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:movieID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await movieService.trash(req.params.movieID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:movieID/delete',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await movieService.delete(req.params.movieID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );


  return route;
};
