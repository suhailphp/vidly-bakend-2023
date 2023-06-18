const Fs = require('fs');
const path = require('path');

Fs.readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    module.exports[file.replace('.js', '')] = require(path.join(__dirname, file));
  });
