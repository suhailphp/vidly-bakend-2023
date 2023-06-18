const { ForbiddenError, NotFoundError } = require('../utilities/errors');
const SecurityCheck = require('../utilities/securityCheck');

module.exports.securityCheck = function (req, res, next) {
  SecurityCheck.fixObject(req.body);
  SecurityCheck.fixObject(req.query);
  SecurityCheck.fixObject(req.params);
  return next();
};
const Models = require('../models');
const { log } = require('handlebars');

module.exports.authenticateUser = function () {
  return async function (req, res, next) {
    const isAjaxRequest = req.xhr;
    try {
      if (req.url.indexOf('rurl') >= 0) req.rurl = `?rurl=${req.query.rurl}`;
      if (req.url.indexOf('/employee/login') === 0) {
        return next();
      }
      if (req.url.indexOf('/dist') === 0) {
        return next();
      }
      if (req.url.indexOf('/employee/logout') === 0) {
        if (req.session && req.session.userName) {
          delete req.session.userName;
          await req.flashS('Logout Successful.');
        }
        res.redirect(`/employee/login${req.rurl || ''}`);
      } else if (req.session && req.session.userName) {
        const employeeRepo = await Models.Employee.findOne({
          where: { userName: req.session.userName, active: true },
          attributes:['employeeID','fullNameEn','fullNameAr','email','mobile','profilePhotoDocumentID','userType','userPrivileges'],
          
        });
        if (employeeRepo) {
          if(employeeRepo.userType === 'COMPETENCY-USER'){
            let userPrivileges = JSON.parse(employeeRepo.userPrivileges)
            employeeRepo.userPrivileges = userPrivileges.map(prev=>prev.value)
          }
          else{
            employeeRepo.userPrivileges = []
          }
          req.Employee = employeeRepo;
          if (employeeRepo.language !== req.language) {
            employeeRepo.language = req.language === 'en' ? 'en' : 'ar';
            await employeeRepo.save();
          }
          return next();
        }
        await req.flashW('Employee not found!');
        return res.redirect(`/employee/login?rurl=${req.query.rurl}`);
      } else {
        return res.redirect(`/employee/login?rurl=${req.url}`);
      }
    } catch (e) {
      next(e);
    }
  };
};
module.exports.authorization = function (allows = []) {
  return function (req, res, next) {
    let flag = false;
    allows.forEach((val) => {
      if (req.Employee && req.Employee.userType === val) {
        flag = true;
        return next();
      }
    });
    const isAjaxRequest = req.xhr;
    if (!flag) {
      if (!isAjaxRequest) next(new ForbiddenError());
      else return res.json({ message: 'Unauthorized Employee.', error: true });
    }
  };
};

module.exports.checkAuthorization = function(userType,allows = []){
  if(allows.indexOf(userType) !== -1) return true
  else return false
}

module.exports.checkUserPrivilege = function(privilege){
  return function (req, res, next) {
    if(req.Employee.userType !== 'COMPETENCY-USER') 
      return next()
    else if(req.Employee.userPrivileges && req.Employee.userPrivileges.indexOf(privilege) !== -1) 
      return next()
    else  
      next(new ForbiddenError());
  }
}
