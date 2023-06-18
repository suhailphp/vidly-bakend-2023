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
        module: 'genre',
        title: 'Genre',
        allow: ['ADMIN', 'SUPER-ADMIN'],
        url: `${appConfig.BASE_URL}genre`,
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 14H18V10H20C20.6 10 21 10.4 21 11V13C21 13.6 20.6 14 20 14ZM21 19V17C21 16.4 20.6 16 20 16H18V20H20C20.6 20 21 19.6 21 19ZM21 7V5C21 4.4 20.6 4 20 4H18V8H20C20.6 8 21 7.6 21 7Z" fill="currentColor" />
                <path opacity="0.3" d="M17 22H3C2.4 22 2 21.6 2 21V3C2 2.4 2.4 2 3 2H17C17.6 2 18 2.4 18 3V21C18 21.6 17.6 22 17 22ZM10 7C8.9 7 8 7.9 8 9C8 10.1 8.9 11 10 11C11.1 11 12 10.1 12 9C12 7.9 11.1 7 10 7ZM13.3 16C14 16 14.5 15.3 14.3 14.7C13.7 13.2 12 12 10.1 12C8.10001 12 6.49999 13.1 5.89999 14.7C5.59999 15.3 6.19999 16 7.39999 16H13.3Z" fill="currentColor" />
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
