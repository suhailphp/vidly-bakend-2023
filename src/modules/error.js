// https://www.smashingmagazine.com/2020/08/error-handling-nodejs-error-classes/
// Here is the base error classes to extend from
// eslint-disable-next-line max-classes-per-file
const i18n = require('i18n');

class ApplicationError extends Error {
  get name() {
    return this.constructor.name;
  }

  get statusCode() {
    return 500;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
      name: this.name,
    };
  }
}

class DatabaseError extends ApplicationError {
}

class UserFacingError extends ApplicationError {
}

class BadRequestError extends UserFacingError {
  constructor(message, options = { translate: true }) {
    if (!options.translate) {
      super(message);
    } else {
      super(i18n.__(message || 'Invalid input provided'));
    }

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(options)) {
      if (!['translate'].indexOf(key)) {
        this[key] = value;
      }
    }
  }

  get statusCode() {
    return 400;
  }
}

class NotFoundError extends UserFacingError {
  constructor(message, options = { translate: true }) {
    if (!options.translate) {
      super(message);
    } else {
      super(i18n.__(message || 'Page not found'));
    }

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(options)) {
      if (!['translate'].indexOf(key)) {
        this[key] = value;
      }
    }
  }

  get statusCode() {
    return 404;
  }
}

class ForbiddenError extends UserFacingError {
  constructor(message, options = { translate: true }) {
    if (!options.translate) {
      super(message);
    } else {
      super(i18n.__(message || 'Access denied'));
    }

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(options)) {
      if (!['translate'].indexOf(key)) {
        this[key] = value;
      }
    }
  }

  get statusCode() {
    return 403;
  }
}

class CustomError extends UserFacingError {
  constructor(message, options = { translate: true }) {
    if (!options.translate) {
      super(message);
    } else {
      super(i18n.__(message || 'Unknown Error'));
    }

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(options)) {
      if (['translate'].indexOf(key) === -1) {
        this[key] = value;
      }
    }
  }

  set statusCode(c) {
    this._statusCode = c;
  }

  get statusCode() {
    return this._statusCode || 500;
  }
}

module.exports = {
  ApplicationError,
  DatabaseError,
  UserFacingError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  CustomError,
};
