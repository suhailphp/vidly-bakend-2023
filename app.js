const express = require('express');

const app = express();
// eslint-disable-next-line import/order
const appConfig = require('./src/config');
const session = require('express-session');
// redis
const { createClient } = require('redis');
const RedisStore = require('connect-redis')(session);
const timeout = require('connect-timeout');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const helpers = require('handlebars-helpers')();
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const fs = require('fs');
const path = require('path');

const { ENV } = appConfig;
const { v2: { requestLogger, logger } } = require('psa-module');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
// eslint-disable-next-line import/order
const Utils = require('./src/utilities');

// flash
app.use(Utils.flash());

// i18
const i18n = require('i18n');

// favicon
const favicon = require('serve-favicon');

// error handler
const { errorHandler } = require('psa-module').v2.middlwares;

const { getSideMenu } = require('./src/utilities/authorization');

// models
// eslint-disable-next-line import/order
const Models = require('./src/models');

// preheaader
app.use(async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (!appConfig.APP_CONFIG) {
      appConfig.APP_CONFIG_PUBLIC = { 'SHOW-NO-DATA-FOUND': null };
    }
    next();
  } catch (e) { next(e); }
});

// bodyparser
app.enable('trust proxy');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('_method'));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ENV === 'production' ? '604800000' : null, // uses milliseconds per docs (week 604800 000)
}));

// method Override
app.enable('trust proxy');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('_method'));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ENV === 'production' ? '604800000' : null, // uses milliseconds per docs (week 604800 000)
}));

// cookies
app.use(cookieParser());

// //public folder
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ENV === 'production' ? '604800000' : null, // uses milliseconds per docs (week 604800 000)
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// session
app.use(session({
  name: appConfig.SESSION.COOKIE_NAME,
  resave: false,
  saveUninitialized: false, // don't create session until something stored
  secret: appConfig.SESSION.SECRET,
  cookie: { maxAge: appConfig.SESSION.COOKIE_AGE }, // Default 1 Day , On Remember me 7 Days
  store: new RedisStore({ prefix: appConfig.SESSION.PREFIX }),
  expires: true,
}));

// gatekeeper
// eslint-disable-next-line import/order
const middlewares = require('./src/middlewares/index');

//app.use(middlewares.gatekeeper.authenticateUser(Models));

i18n.configure({
  locales: ['en', 'ar'],
  // fallbacks: {'en': 'ar'},
  // defaultLocale: 'ar',
  objectNotation: '>>',
  cookie: '_lng',
  directory: `${__dirname}/locales`,
  autoReload: true,
  api: {
    __: '__',
    __n: '__n',
  },
});
app.use(i18n.init);

app.get('/_t', async (req, res, next) => {
  res.json({ t: i18n.__(req.query.t) });
});


app.use((req, res, next) => {
  if (!req.cookies._lng) {
    req.cookies._lng = 'ar';
    req.language = 'ar';
  }
  i18n.setLocale(req.cookies._lng);
  res.locals.EMPLOYEE = req.Employee;
  res.locals.LNG = req.language;

  // console.log(req.url, req.language);

  res.locals.DIR = req.language === 'ar' ? 'rtl' : 'ltr';
  res.locals.CONFIG = appConfig;
  res.locals.errorMessage = req.flash('errorMessage');
  res.locals.successMessage = req.flash('successMessage');
  res.locals.infoMessage = req.flash('infoMessage');
  res.locals.warningMessage = req.flash('warningMessage');
  res.locals.SIDE_MENU = getSideMenu({ user: req.Employee, url: req.url, counts: { } });
  return next();
});

// handlerbars
const hbs = exphbs.create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: '.hbs',
  defaultLayout: 'default',
  partialsDir: [
    path.join(__dirname, './src/client/views/partials/'),
  ],
  helpers: { ...helpers, ...Utils.viewHelpers },
});
app.use(timeout('120s'));
app.set('views', path.join(__dirname, './src/client/views'));
app.set('layoutsDir', path.join(__dirname, './src/client/views/layouts'));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

fs.readdirSync(path.join(__dirname, './src/routes')).forEach((file) => {
  require(path.join(__dirname, './src/routes', file))(app);
});

errorHandler({
  app,
  render: {
    view: 'error',
    layout: null,
  },
});

// logger w
// const logger = require('./src/modules/logger');
if (ENV === 'development') {
  process.on('uncaughtException', (err) => {
    logger.debug('uncaughtException');
    logger.error(err);
    console.log('uncaughtException');
    console.log(err);
  });
}

// request logger
// const requestLogger = require('./src/modules/requestLogger');
// requestLogger({
//     app,
//     options: {
//         userKey: 'Employee.UserName',
//     },
// });

// request logger form psa module
requestLogger({ app, options: { userKey: 'UserName', ignoreURLs: [] } });

app.set('port', appConfig.PORT);
module.exports = app;
