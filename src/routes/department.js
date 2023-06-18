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

const DepartmentService = require('../services/department');
const { log } = require('console');

const moduleName = 'Department';

module.exports = (app) => {
  app.use('/department', route);
  const departmentService = new DepartmentService();
  route.get(
    '/',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        if (!req.xhr) {
          const data = {
            title: 'Departments',
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('list'),
          };
          return res.render('department/list', data);
        }
        const data = await departmentService.get({
          query: req.query,
          deleted: false,
        });
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
            title: 'Department trash',
            breadcrumb: breadcrumbs.init(__filename, moduleName).add('Trash'),
          };
          return res.render('department/list', data);
        }
        const data = await departmentService.get({
          query: req.query,
          deleted: true,
        });
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
        let level = 1;
        if (Array.isArray(req.body.parentID)) {
          req.body.parentID = req.body.parentID.filter((str) => str !== '');
          req.body.parentID = req.body.parentID[req.body.parentID.length - 1];
          const LevelData = await departmentService.getOne(req.body.parentID);
          level = LevelData.level + 1;
        } else if (req.body.parentID && req.body.parentID !== '') {
          const LevelData = await departmentService.getOne(req.body.parentID);
          level = LevelData.level + 1;
        }

        const resData = await departmentService.getOne(req.body.departmentID);
        if (resData) {
          await departmentService.update({
            ...req.body,
            level,
            updatedEmployeeID: req.Employee.employeeID,
          });
          return res.send(true);
        }
        await departmentService.insert({
          ...req.body,
          level,
          creatEdemployeeID: req.Employee.employeeID,
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
          departments: await departmentService.getAll({ level: 1 }),
          data: { category: 'other' },
        };

        res.render('department/form', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/edit',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = {
          layout: null,
          mode: 'edit',
          departments: await departmentService.getAll({ level: 1, departmentID: req.params.departmentID }),
        };

        data.data = await departmentService.getOne(req.params.departmentID);
        if (data.data) {
          // for department selection
          data.levelData = [];
          data.emptyDiv = [];
          // const curDep = await Models.Department.findOne({ where: { DepartmentID: data.ParentID } });
          const curDep = await departmentService.getOne(data.data.parentID);
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
          // console.log(data.levelData);
          // setting empty div data for ajax
          for (let i = data.levelData.length; i < 10; i++) {
            data.emptyDiv.push({ level: i });
          }
          res.render('department/form', data);
        } else res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/view',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await departmentService.getOne(req.params.departmentID);
        if (data.data) {
          return res.render('department/view', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/status',
    // gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await departmentService.changeStatus(req.params.departmentID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/trash',
    gatekeeper.authorization(['SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await departmentService.trash(req.params.departmentID, req.Employee.employeeID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/delete',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = await departmentService.delete(req.params.departmentID);
        res.send(data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:departmentID/:parentID/checkParentDep',
    gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const curDep = await departmentService.getOne(req.params.parentID);
        const departments = await departmentService.getAll({ parentID: req.params.parentID });
        if (departments && departments[0]) {
          let html = `
                    <select class="form-select " data-control=""  data-placeholder="${req.__('Select parent department')}" name="parentID" id="parentID${curDep.level + 1}" onchange="DepChange(this)">
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
