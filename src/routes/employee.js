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
const {newhr} = require('psa-module')

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ApplicationError,
} = require('../modules/error');

const EmployeeService = require('../services/employee');
const DepartmentService = require('../services/department');
const CourseLevelService = require('../services/courseLevel');
const { log } = require('console');

const moduleName = 'Employee';

module.exports = (app) => {
  app.use('/employee', route);
  const employeeService = new EmployeeService();
  const departmentService = new DepartmentService();
  const courseLevelService = new CourseLevelService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: 'Employee',
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('employee/list', data);
        }

        const data = await employeeService.get({
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
            title: 'Employee trash',
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Deleted'),
          };
          return res.render('employee/list', data);
        }

        const data = await employeeService.get({
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
        const employee = await employeeService.getOne(req.body.employeeID);
        if (Array.isArray(req.body.departmentID)) {
          req.body.departmentID = req.body.departmentID.filter((str) => str !== '');
          req.body.departmentID = req.body.departmentID[req.body.departmentID.length - 1];
        }

        if (employee) {
          if (await employeeService.checkUserName(req.body.userName, req.body.employeeID)) { return res.send({success: false} ); }
          const resData = await employeeService.update({
            ...req.body,
            profilePhoto: _.find(req.files, { fieldname: 'profilePhoto' }),
            currentEmployeeID: req.Employee.employeeID,
          });
          return res.send({success: true, employeeID: resData.courseID });
        }

        if (await employeeService.checkUserName(req.body.userName)) { return res.send({success: false} ); }
        const resData = await employeeService.insert({
          ...req.body,
          profilePhoto: _.find(req.files, { fieldname: 'profilePhoto' }),
          currentEmployeeID: req.Employee.employeeID,
        });
        return res.send({success: true, employeeID: resData.employeeID });
      } catch (e) {
        //console.log(e)
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
          mode: 'add',
          bgImage: `${appConfig.BASE_URL}dist/assets/media/avatars/blank.png`,
          departments: await departmentService.getAll({ level: 1 }),
          courseLevel: await courseLevelService.getAll(),
        };
        res.render('employee/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/formModal',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'add',
          bgImage: `${appConfig.BASE_URL}dist/assets/media/avatars/blank.png`,
          departments: await departmentService.getAll({ level: 1 }),
          courseLevel: await courseLevelService.getAll(),
        };
        res.render('employee/formModal', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:employeeID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          mode: 'edit',
          departments: await departmentService.getAll({ level: 1, departmentID: req.params.departmentID }),
          courseLevel: await courseLevelService.getAll(),
        };
        data.data = await employeeService.getOne(req.params.employeeID);
        if (data.data) {
          if (data.data.profilePhotoDocumentID) {
            data.bgImage = `${appConfig.BASE_URL}employee/document/${req.params.employeeID}`;
          } else {
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/avatars/blank.png`;
          }

          data.levelData = [];
          data.emptyDiv = [];
          // const curDep = await Models.Department.findOne({ where: { DepartmentID: data.ParentID } });
          const curDep = await departmentService.getOne(data.data.departmentID);
          if (curDep && curDep.level >= 1) {
            let { level, parentID } = curDep;
            let curDepartmentID = curDep.departmentID;
            for (let i = level; i >= 1; i--) {
              const levelData = {
                curDepartmentID,
                level,
                departments: await departmentService.getAll({ level, parentID }),
              };
              data.levelData[i] = levelData;
              // setting data for parent department
              const nextDep = await departmentService.getOne(parentID);
              if (nextDep) {
                curDepartmentID = nextDep.departmentID;
                parentID = nextDep.parentID;
                level = nextDep.level;
              }
            }
          }
          // setting empty div data for ajax
          for (let i = data.levelData.length; i < 10; i++) {
            data.emptyDiv.push({ level: i });
          }
          res.render('employee/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:employeeID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await employeeService.getOne(req.params.employeeID);
        if (data.data) {
          data.bgImage = Utils.general.nameToIcon(data.data, req.language);
          return res.render('employee/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:employeeID/status',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await employeeService.changeStatus(req.params.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:employeeID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await employeeService.trash(req.params.employeeID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:employeeID/delete',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await employeeService.delete(req.params.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/login',
    async (req, res, next) => {
      try {
        res.render('employee/login', { layout: null });
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/login',
    async (req, res, next) => {
      try {
        let { userName } = req.body;
        const { password } = req.body;
        const user = await employeeService.getUserName(userName);
        // console.log(user.ADLogin);
        // logger.info('hello');

        if (!user) {
          return res.json({
            message: req.__('employee not registered, please try again !'),
          });
        }

        if (user.ADLogin) {
          // eslint-disable-next-line new-cap
          const ad = new activeDirectory(appConfig.DOMAIN);
          if (userName.indexOf('@p') === -1) userName += '@psa.local';
          if (userName.indexOf('@psa.ac.ae') !== -1) userName = userName.replace('@psa.ac.ae', '@psa.local');
          ad.authenticate(userName, password, async (err, auth) => {
            if (auth) {
              req.session.userName = userName.replace('@psa.local', '');
              user.lastLoggedIn = Date.now();
              await user.save();
              return res.json({
                message: req.__('Login Successful.'),
                success: true,
              });
            }
            return res.json({
              message: req.__('Username or password is wrong, please try again !'),
            });
          });
        } else {
          const passwordHash = await Utils.crypto.getHash(password, user.passwordSalt);
          if (user.password === passwordHash) {
            req.session.userName = userName;
            user.lastLoggedIn = Date.now();
            await user.save();
            return res.json({
              message: req.__('Login Successful.'),
              success: true,
            });
          }
          return res.json({
            message: req.__('Username or password is wrong, please try again !'),
          });
        }
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/document/:employeeID',
    async (req, res, next) => {
      try {
        const document = await employeeService.getImage(req.params.employeeID);
        // console.log(document.profilePhoto.data);
        if (document && document.profilePhoto) {
          res.setHeader('Content-Type', document.profilePhoto.fileType);
          // res.setHeader('Content-disposition', 'attachment; filename=' + data.Document.FileName);
          return res.send(Buffer.from(document.profilePhoto.data, 'utf8'));
        }
        return next(new Error(404));
      } catch (e) {
        next(e);
      }
    },
  );

  route.get('/:militaryNumber/fetchStaffFromHCM',
    async (req, res, next) => {
        try {
            let emp = await newhr.findOne(req.params.militaryNumber)
            //console.log(emp)
            if(emp){
                let curEmp = _.find(emp,function (employee){
                    if(employee.employeeID == req.params.militaryNumber){
                        return true;
                    }
                })
                return res.send((curEmp)?curEmp:false)
            }
            else{
                return res.send(false)
            }
        }
        catch (error){
            debug(error.message)
            res.send(false)
        }
    });
    
  route.get(
    '/:departmentID/checkParentDep',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const curDep = await departmentService.getOne(req.params.departmentID);
        const departments = await departmentService.getAll({ parentID: req.params.departmentID });
        if (departments && departments[0]) {
          let html = `
                    <select class="form-select " data-control=""  data-placeholder="${req.__('Select department')}" name="departmentID" id="departmentID${curDep.level + 1}" onchange="DepChange(this)">
                        <option value=""></option>`;
          for (const key in departments) {
            const value = departments[key];
            if (value.departmentID) {
              html += `<option value="${value.departmentID}" >
                        ${(req.language === 'ar' ? value.nameAr : value.nameEn)}</option>`;
            }
          }
          html += '</select>';
          return res.send({ level: curDep.level + 1, html });
        }
        return res.send({ level: curDep.level + 1, html: null });
      } catch (e) {
        next(e);
      }
    },
  );

  

  return route;
};
