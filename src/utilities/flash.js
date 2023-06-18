const { format } = require('util');
const { isArray } = require('util');
/**
  * Expose `flash()` function on requests.
  *
  * @return {Function}
  * @api public
  */
module.exports = function flash(options) {
  options = options || {};
  const safe = (options.unsafe === undefined) ? true : !options.unsafe;
  const { resFn } = options;
  return function (req, res, next) {
    if (req.flash && safe) {
      return next();
    }
    req.flash = _flash;
    req.flashPush = _flashPush;
    req.flashE = (function (msg) {
      if (resFn) { msg = res[resFn](msg); }
      return new Promise((fulfill, reject) => {
        req.flash('errorMessage', msg);
        req.session.save((err) => {
          if (err) { return reject(err); } return fulfill();
        });
      });
    });
    req.flashS = (function (msg) {
      if (resFn) { msg = res[resFn](msg); }
      return new Promise((fulfill, reject) => {
        req.flash('successMessage', msg);
        req.session.save((err) => {
          if (err) { return reject(err); } return fulfill();
        });
      });
    });
    req.flashW = (function (msg) {
      if (resFn) { msg = res[resFn](msg); }
      return new Promise((fulfill, reject) => {
        req.flash('warningMessage', msg);
        req.session.save((err) => {
          if (err) { return reject(err); } return fulfill();
        });
      });
    });
    req.flashI = (function (msg) {
      if (resFn) { msg = res[resFn](msg); }
      return new Promise((fulfill, reject) => {
        req.flash('infoMessage', msg);
        req.session.save((err) => {
          if (err) { return reject(err); } return fulfill();
        });
      });
    });
    next();
  };
};
function _flash(type, msg, cb) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  const msgs = this.session.flash = this.session.flash || {};
  if (type && msg) {
    return msgs[type] = (msg);
  } if (type) {
    const arr = msgs[type];
    delete msgs[type];
    return arr || [];
  }
  this.session.flash = {};
  return msgs;
}
function _flashPush(type, msg, cb) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  const msgs = this.session.flash = this.session.flash || {};
  if (type && msg) {
    // util.format is available in Node.js 0.6+
    if (arguments.length > 2 && format) {
      const args = Array.prototype.slice.call(arguments, 1);
      msg = format.apply(undefined, args);
    } else if (isArray(msg)) {
      msg.forEach((val) => {
        (msgs[type] = msgs[type] || []).push(val);
      });
      return msgs[type].length;
    }
    return (msgs[type] = msgs[type] || []).push(msg);
  } if (type) {
    const arr = msgs[type];
    delete msgs[type];
    return arr || [];
  }
  this.session.flash = {};
  return msgs;
}
