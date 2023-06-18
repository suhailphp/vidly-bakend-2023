const _ = require('underscore');
const i18n = require('i18n');
const appConfig = require('../config');
const {
  checkAuthorization,
} = require('../middlewares/gatekeeper');

const menuList = [
  [
    {
      module: 'Home',
      title: 'Home',
      allow: ['ADMIN', 'SUPER-ADMIN', 'USER','COMPETENCY-USER','DEPARTMENT-HEAD','HR-USER'],
      url: `${appConfig.BASE_URL}`,
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" />
                  <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="currentColor" />
                  <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="currentColor" />
                  <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="currentColor" />
              </svg>`,
    },
    {
      module: 'CourseRequest',
      title: 'Course Request',
      allow: ['ADMIN', 'SUPER-ADMIN','DEPARTMENT-HEAD','COMPETENCY-USER','HR-USER'],
      url: `#`,
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor"/>
              <path d="M20 8L14 2V6C14 7.10457 14.8954 8 16 8H20Z" fill="currentColor"/>
              <rect x="13.6993" y="13.6656" width="4.42828" height="1.73089" rx="0.865447" transform="rotate(45 13.6993 13.6656)" fill="currentColor"/>
              <path d="M15 12C15 14.2 13.2 16 11 16C8.8 16 7 14.2 7 12C7 9.8 8.8 8 11 8C13.2 8 15 9.8 15 12ZM11 9.6C9.68 9.6 8.6 10.68 8.6 12C8.6 13.32 9.68 14.4 11 14.4C12.32 14.4 13.4 13.32 13.4 12C13.4 10.68 12.32 9.6 11 9.6Z" fill="currentColor"/>
            </svg>`,
      subMenu: [
        {
          module: 'CourseRequest',
          title: 'Request',
          allow: ['ADMIN', 'SUPER-ADMIN','DEPARTMENT-HEAD','COMPETENCY-USER','HR-USER'],
          url: `${appConfig.BASE_URL}courseRequest`,
          fallbackURL: [`${appConfig.BASE_URL}courseRequest/form`,`${appConfig.BASE_URL}courseRequest/:value/edit`],
          icon: '<span class="bullet bullet-dot"></span>',
        },
        {
          module: 'CourseTransferred',
          title: 'Transferred',
          allow: ['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER'],
          url: `${appConfig.BASE_URL}courseRequest/transferred`,
          icon: '<span class="bullet bullet-dot"></span>',
        },
        {
          module: 'CourseRejectedd',
          title: 'Rejected',
          allow: ['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER','HR-USER'],
          url: `${appConfig.BASE_URL}courseRequest/rejected`,
          icon: '<span class="bullet bullet-dot"></span>',
        },

      ],
    },
    {
      module: 'Course',
      title: 'Course',
      allow: ['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER'],
      url: `${appConfig.BASE_URL}course`,
      fallbackURL: [`${appConfig.BASE_URL}course/form`,`${appConfig.BASE_URL}course/:value/edit`],
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor"/>
              <path d="M20 8L14 2V6C14 7.10457 14.8954 8 16 8H20Z" fill="currentColor"/>
              <path d="M10.3629 14.0084L8.92108 12.6429C8.57518 12.3153 8.03352 12.3153 7.68761 12.6429C7.31405 12.9967 7.31405 13.5915 7.68761 13.9453L10.2254 16.3488C10.6111 16.714 11.215 16.714 11.6007 16.3488L16.3124 11.8865C16.6859 11.5327 16.6859 10.9379 16.3124 10.5841C15.9665 10.2565 15.4248 10.2565 15.0789 10.5841L11.4631 14.0084C11.1546 14.3006 10.6715 14.3006 10.3629 14.0084Z" fill="currentColor"/>
            </svg>`,
    },
    {
      module: 'Employee',
      title: 'Employee',
      allow: ['ADMIN', 'SUPER-ADMIN','COMPETENCY-USER'],
      url: `${appConfig.BASE_URL}employee`,
      fallbackURL: [`${appConfig.BASE_URL}employee/form`,`${appConfig.BASE_URL}employee/:value/edit`],
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 14H18V10H20C20.6 10 21 10.4 21 11V13C21 13.6 20.6 14 20 14ZM21 19V17C21 16.4 20.6 16 20 16H18V20H20C20.6 20 21 19.6 21 19ZM21 7V5C21 4.4 20.6 4 20 4H18V8H20C20.6 8 21 7.6 21 7Z" fill="currentColor" />
                <path opacity="0.3" d="M17 22H3C2.4 22 2 21.6 2 21V3C2 2.4 2.4 2 3 2H17C17.6 2 18 2.4 18 3V21C18 21.6 17.6 22 17 22ZM10 7C8.9 7 8 7.9 8 9C8 10.1 8.9 11 10 11C11.1 11 12 10.1 12 9C12 7.9 11.1 7 10 7ZM13.3 16C14 16 14.5 15.3 14.3 14.7C13.7 13.2 12 12 10.1 12C8.10001 12 6.49999 13.1 5.89999 14.7C5.59999 15.3 6.19999 16 7.39999 16H13.3Z" fill="currentColor" />
            </svg>`,
    },
    {
      module: 'setting',
      title: 'Settings',
      allow: ['ADMIN', 'SUPER-ADMIN'],
      url: '#',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M21.25 18.525L13.05 21.825C12.35 22.125 11.65 22.125 10.95 21.825L2.75 18.525C1.75 18.125 1.75 16.725 2.75 16.325L4.04999 15.825L10.25 18.325C10.85 18.525 11.45 18.625 12.05 18.625C12.65 18.625 13.25 18.525 13.85 18.325L20.05 15.825L21.35 16.325C22.35 16.725 22.35 18.125 21.25 18.525ZM13.05 16.425L21.25 13.125C22.25 12.725 22.25 11.325 21.25 10.925L13.05 7.62502C12.35 7.32502 11.65 7.32502 10.95 7.62502L2.75 10.925C1.75 11.325 1.75 12.725 2.75 13.125L10.95 16.425C11.65 16.725 12.45 16.725 13.05 16.425Z" fill="currentColor"></path>
              <path d="M11.05 11.025L2.84998 7.725C1.84998 7.325 1.84998 5.925 2.84998 5.525L11.05 2.225C11.75 1.925 12.45 1.925 13.15 2.225L21.35 5.525C22.35 5.925 22.35 7.325 21.35 7.725L13.05 11.025C12.45 11.325 11.65 11.325 11.05 11.025Z" fill="currentColor"></path>
            </svg>`,
      subMenu: [
        {
          module: 'department',
          title: 'Departments',
          allow: ['ADMIN', 'SUPER-ADMIN'],
          url: `${appConfig.BASE_URL}department`,
          icon: '<span class="bullet bullet-dot"></span>',
        },
        {
          module: 'courseLevel',
          title: 'Course Level',
          allow: ['ADMIN', 'SUPER-ADMIN'],
          url: `${appConfig.BASE_URL}courseLevel`,
          icon: '<span class="bullet bullet-dot"></span>',
        },
        {
          module: 'courseCategory',
          title: 'Course Category',
          allow: ['ADMIN', 'SUPER-ADMIN'],
          url: `${appConfig.BASE_URL}courseCategory`,
          icon: '<span class="bullet bullet-dot"></span>',
        },

        {
          module: 'courseDepartment',
          title: 'Course Department',
          allow: ['ADMIN', 'SUPER-ADMIN'],
          url: `${appConfig.BASE_URL}courseDepartment`,
          icon: '<span class="bullet bullet-dot"></span>',
        },



      ],
    },


  ],
];

function setSelection(eachMenu, url, counts) {
  let flag = false;
  for (let i = 0; i < eachMenu.length; i++) {
    const item = eachMenu[i];
    item.selected = false;
    if (item.url === url || `${item.url}/` === url || item.url === `${url}/`) {
      // eslint-disable-next-line no-multi-assign
      flag = item.selected = true;
    } else if (item.fallbackURL) {
      for (let j = 0; j < item.fallbackURL.length; j++) {
        const fallbackURL = item.fallbackURL[j];
        // const replacedUrl = url.replace(/[^/]*.form[^/]/, '/:value/');
        // const replacedUrl = url.replace(/product.*form/, 'product/:value/form/');
        const replacedUrl = url.replace(/\/[0-9]{1,10}\//, '/:value/');
        // console.log(replacedUrl);
        // console.log(fallbackURL === replacedUrl, fallbackURL, ` == ${replacedUrl}`);
        if (fallbackURL === url || `${fallbackURL}/` === url || fallbackURL === `${url}/`) {
          // eslint-disable-next-line no-multi-assign
          flag = item.selected = true;
        } else if (fallbackURL === replacedUrl || `${fallbackURL}/` === replacedUrl || fallbackURL === `${replacedUrl}/`) {
          // eslint-disable-next-line no-multi-assign
          flag = item.selected = true;
        }
      }
    }
    if (item.subMenu) {
      const f = setSelection(item.subMenu, url, counts);
      if (f) {
        // eslint-disable-next-line no-multi-assign
        flag = item.selected = true;
      } else {
        item.selected = false;
      }
    }
  }
  return flag;
}

function getMenu(user, eachMenu, selected, i = 0) {
//   let html = i === 0 ? '<ul class="menu-nav">' : '<ul class="menu-subnav">';
  let html = '';
  /* eslint-disable no-tabs */
  eachMenu.forEach((item, index) => {
    if (item.allow) {
      if ((user && user.userType) && !checkAuthorization(user.userType, item.allow)) {
        return '';
      }
    }
    if (item.subMenu) {
      html += `
        <div data-kt-menu-trigger="click" class="menu-item ${item.selected ? 'here show' : ''} menu-accordion">
        <!--begin:Menu link-->
        <span class="menu-link">
            <span class="menu-icon">
                <!--begin::Svg Icon | path: icons/duotune/general/gen025.svg-->
                <span class="svg-icon svg-icon-2">
                    ${item.icon ? item.icon : ''}
                </span>
                <!--end::Svg Icon-->
            </span>
            <span class="menu-title">${item.noTrans ? item.title : i18n.__(item.title)}</span>
            <span class="menu-arrow"></span>
        </span>
        <!--end:Menu link-->
        <!--begin:Menu sub-->
        <div class="menu-sub menu-sub-accordion">
        `;
      html += getMenu(user, item.subMenu, item.selected, i + 1);
      html += `
        </div>
        <!--end:Menu sub-->
    </div> 
    <!--end:Menu item-->
      `;
    } else {
      html += `
      <div class="menu-item">
            <!--begin:Menu link-->
            <a class="menu-link ${item.selected ? 'active' : ''}" href="${item.url || '#'}">
                <span class="menu-icon">
                    <!--begin::Svg Icon | path: icons/duotune/general/gen025.svg-->
                    <span class="svg-icon svg-icon-2">
                        ${item.icon ? item.icon : ''}
                    </span>
                    <!--end::Svg Icon-->
                </span>
                <span class="menu-title">${item.noTrans ? item.title : i18n.__(item.title)}</span>
            </a>
            <!--end:Menu link-->
            <!--begin:Menu sub-->
            
            <!--end:Menu sub-->
        </div> 
      `;
    }
  });
  return html;
}

module.exports.getSideMenu = function ({ user, url, counts }) {
  // console.log(user);
  const URL = appConfig.BASE_URL.substr(0, appConfig.BASE_URL.length - 1)
    + url.split('?')[0];

  let html = '';

  for (const eachMenu of [...menuList]) {
    setSelection(eachMenu, URL, counts);
    html += `${getMenu(user, eachMenu, false, 0)}`;
  }

  return html.replace(/\t/g, '').replace(/\n/g, '');
};
