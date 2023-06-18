const { Router } = require('express');
const breadcrumbs = require('../utilities/breadcrumbs');

const { log } = require('handlebars');
const appConfig = require('../config');
const { gatekeeper } = require('../middlewares/index');


const route = Router();
// const { v2: { logger } } = require('psa-module');
const moduleName = 'Dashboard';

module.exports = (app) => {
  app.use('/', route);


  route.get(
    '/',
    async (req, res, next) => {
      try {
        const data = {
          title: req.__('Home'),
          breadcrumb: breadcrumbs.init().add(req.__('Employee profile')),
        };
        data.data = []
        res.render('home/main', data);
      } catch (e) {
        next(e);
      }
    },
  );

 


  return route;
};
