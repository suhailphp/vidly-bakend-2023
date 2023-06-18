const path = require('path');
const appConfig = require('../config');

// eslint-disable-next-line no-extend-native
Array.prototype.add = function (title, link, active = false) {
  this.push({ title, link: !link ? null : appConfig.BASE_URL + link, active });
  return this;
};

module.exports = {
  init(fileName, moduleName, active = false) {
    if (!fileName && !moduleName) return [];

    const controllerPath = appConfig.BASE_URL + path.basename(fileName).replace('.js', '');
    const breadCrumb = [
      { title: moduleName, link: controllerPath, active },
    ];
    return breadCrumb;
  },
};
