const i18n = require('i18n');
const moment = require('moment');
const appConfig = require('../config');
const { log } = require('console');

module.exports = {
  __(val, b) {
    return val ? i18n.__(val, b) : '';
  },

  dateToStringSimple(date) {
    if (!date || typeof date !== 'object') return null;
    return moment(date).format('DD-MM-YYYY h:mm:ss');
  },

  dateCombine(date1,date2, type) {
    if (!date1 || typeof date1 !== 'object' || !date2 || typeof date2 !== 'object') return null;
    if(type === 'date')
      return `${moment(date1).format('DD-MM-YYYY')} to ${moment(date2).format('DD-MM-YYYY')}`;
    else
      return `${moment(date1).format('hh:mm A')}-${moment(date2).format('hh:mm A')}`
  },

  dateToString(date) {
    if (!date || typeof date !== 'object' ) return null;
    return `${moment(date).format('MM/DD/YYYY HH:mm:ss')}`;
  },

  weekdaysList(weekdays, LNG){
    if (!weekdays || typeof weekdays !== 'string' ) return null;
    let weekdaysArray = JSON.parse(weekdays)
    let returnString = ''
    for(let i=0;i<weekdaysArray.length;i++){
      let curWeekday = weekdaysArray[i];
      if(curWeekday.value === 'FRI' || curWeekday.value === 'SAT' || curWeekday.value === 'SUN' ){
        returnString += `<span class="badge badge-light-warning fs-7 ms-2">${(LNG === 'ar')?curWeekday.textAr:curWeekday.textEn}</span>`
      }
      else returnString += `<span class="badge badge-light-info fs-7 ms-2">${(LNG === 'ar')?curWeekday.textAr:curWeekday.textEn}</span>`
    }
    return returnString
  },

  simpleDate(date) {
    if (!date || typeof date !== 'object') return null;
    return moment(date).format('DD-MM-YYYY');
  },

  simleTime12(date) {
    if (!date || typeof date !== 'object' ) return null;
    return `${moment(date).format('hh:mm')}`;
  },

  simleTimeAM(date) {
    if (!date || typeof date !== 'object' ) return null;
    return `${moment(date).format('A')}`;
  },

  currencyFormat(amount) {
    if (amount && amount > 0) return (amount.toFixed(2));
    return (0);
  },

  '?': function (lvalue, operator, rvalue, value1, value2) {
    // eg {{? ../LNG '==' 'ar' tFullNameAr FullName}}
    if (arguments.length === 6) {
      const operators = {
        '==': function (l, r) {
          return l === r;
        },
        '===': function (l, r) {
          console.log(l, r);
          return l === r;
        },
        '!=': function (l, r) {
          return l !== r;
        },
        '!==': function (l, r) {
          return l !== r;
        },
        '<': function (l, r) {
          return l < r;
        },
        '>': function (l, r) {
          return l > r;
        },
        '<=': function (l, r) {
          return l <= r;
        },
        '>=': function (l, r) {
          return l >= r;
        },
        typeof(l, r) {
          return typeof l === r;
        },
      };
      if (!operators[operator]) {
        throw new Error(`Handlerbars Helper '?' doesn't know the operator ${operator}`);
      }
      return operators[operator](lvalue, rvalue) ? value1 : value2;
    } if (arguments.length === 4) {
      return lvalue ? operator : rvalue;
    }
    throw new Error('Handlerbars Helper \'?\' needs 3 or 5 parameters');
  },

  currencyFormat(amount) {
    if (amount && amount > 0) return (amount.toFixed(2));
    return (0);
  },

  nameToIcon(nameAr, nameEn, lng) {
    const name = (lng === 'ar') ? nameAr : nameEn;
    const style = ['warning', 'primary', 'success', 'danger'];
    const random = Math.floor(Math.random() * style.length);
    return `
    <div class="symbol-label bg-light-${style[random]}">
        <span class="text-${style[random]}">${name.charAt(0)}</span>
    </div>`;
  },


  messageAttachemntIcon(document) {
    if (document.fileType === 'image/jpeg' || document.fileType === 'image/jpg' || document.fileType === 'image/png') {
      return `<img style="width:auto;height:50px;" src="${appConfig.BASE_URL}message/${document.documentID}/document">     `;
    }
    return `<img alt="" class="w-30px me-3" src="${appConfig.BASE_URL}dist/assets/media/svg/files/${document.fileType}.svg">`;
  },

  courseRequestActionButton(finalApproved, HRApproved,initApproved,transferred,rejected,userType,userPrivileges,LNG) {

    if(!HRApproved || !initApproved){
      if(!HRApproved  && userType == 'HR-USER'){
        return `<button onclick="courseApproval('HRApprove')"  type="submit" class="btn btn-success btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('HR Approve',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              
              <button onclick="courseRejection()"  type="submit" class="btn btn-danger btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Reject',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              
              `
      }
      else if(!initApproved  && userType == 'COMPETENCY-USER' && (userPrivileges && userPrivileges.indexOf('INIT_APPROVE') !== -1)){
        return `<button onclick="courseApproval('initApprove')" type="submit" class="btn btn-success btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Initial Approve',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              
              <button onclick="courseRejection()"  type="submit" class="btn btn-danger btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Reject',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              `
      }
    }
    else if(!finalApproved && !transferred && userType == 'COMPETENCY-USER' && (userPrivileges && userPrivileges.indexOf('FINAL_APPROVE') !== -1)){
      return `<button onclick="courseApproval('finalApprove')" type="submit" class="btn btn-success btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Final Approve',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              <button onclick="courseRejection()"  type="submit" class="btn btn-danger btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Reject',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              `
    }
    else if(!transferred && userType == 'COMPETENCY-USER' && (userPrivileges && userPrivileges.indexOf('FINAL_APPROVE') !== -1)){
      return `<button onclick="courseAction('createCourse')" type="submit" class="btn btn-primary btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Create course',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle m-2"></span></span>
              </button>
              
              <button onclick="courseAction('transferCourse')" type="submit" class="btn btn-primary btn-sm m-2" data-kt-item-action="submit">
                  <i class="bi bi-check-square-fill"></i>
                  <span class="indicator-label">${i18n.__('Add to exisiting course',LNG)}</span>
                  <span class="indicator-progress">Please wait...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
              </button>
              `
    }
  },

  courseRequestApprovalLabel(finalApproved, HRApproved,initApproved,rejected,lng) {
    if(rejected){
      return `<span class="badge badge-sm badge-light-danger d-inline">${i18n.__('Rejected',lng)}</span>`
     }
    else if(finalApproved){
    return `<span class="badge badge-sm badge-light-success d-inline">${i18n.__('Final Approval',lng)}</span>`
   }
   else if(HRApproved && initApproved){
    return `
      <span class="badge badge-sm badge-light-info d-inline m-1">${i18n.__('HR Approval',lng)}</span>
      <span class="badge badge-sm badge-light-primary d-inline m-1">${i18n.__('Initial Approval',lng)}</span>
      `
   }
   else if(HRApproved){
    return `
      <span class="badge badge-sm badge-light-info d-inline m-1">${i18n.__('HR Approval',lng)}</span>
    `
   }
   else if(initApproved){
    return `
      <span class="badge badge-sm badge-light-primary d-inline m-1">${i18n.__('Initial Approval',lng)}</span>
    `
   }
   else{
    return `
      <span class="badge badge-sm badge-light-warning d-inline m-1">${i18n.__('Not Approved',lng)}</span>
    `
   }
  },
};
