/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var format = require('./sprintf');

var errors = module.exports = require('./errors');

if (!Array.isArray) {
  Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  };
}

function failCheck(ExceptionConstructor, callee, messageFormat, formatArgs) {
    messageFormat = messageFormat || '';
    var message = format.apply(this, [messageFormat].concat(formatArgs));

    if (Error.captureStackTrace) {
      var error = new ExceptionConstructor(message);
      Error.captureStackTrace(error, callee);
      throw error;

    } else {
      throw new ExceptionConstructor(message);
    }
}

function failArgumentCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalArgumentError, callee, message, formatArgs);
}

function failStateCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalStateError, callee, message, formatArgs);
}

module.exports.checkArgument = function(value, message) {
    if (!value) {
        failArgumentCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkState = function(value, message) {
    if (!value) {
        failStateCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkIsDef = function(value, message) {
    if (value !== undefined) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined but was undefined.',
        Array.prototype.slice.call(arguments, 2));
};

module.exports.checkIsDefAndNotNull = function(value, message) {
    // Note that undefined == null.
    if (value != null) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined and not null but got "' +
        typeOf(value) + '".', Array.prototype.slice.call(arguments, 2));
};

// Fixed version of the typeOf operator which returns 'null' for null values
// and 'array' for arrays.
function typeOf(value) {
    var s = typeof value;
    if (s == 'object') {
        if (!value) {
            return 'null';
        } else if (Array.isArray(value)) {
            return 'array';
        }
    }
    return s;
}

function typeCheck(expect) {
    return function(value, message, formatArgs) {
        var type = typeOf(value);

        if (type == expect) {
            return value;
        }

        failArgumentCheck(arguments.callee, message ||
            'Expected "' + expect + '" but got "' + type + '".',
            Array.isArray(formatArgs) ? formatArgs : Array.prototype.slice.call(arguments, 2));
    };
}

/**
 * Determines if a string, array, or object are empty.
 * For objects, own properties are all that are considered.
 */
function isEmpty(value) {
    var type = typeOf(value);
    if (type == 'string' && value.length === 0) {
        return true;
    }
    if (type == 'array' && value.length === 0) {
        return true;
    }
    if (type == 'object' && Object.keys(value).length === 0) {
        return true;
    }
    return false;
}

function typeCheckNotEmpty(expect) {
    return function(value, message) {
      var formatArgs = Array.prototype.slice.call(arguments, 2);

      typeCheck(expect)(value, message, formatArgs);

      if (isEmpty(value)) {
          failArgumentCheck(arguments.callee, message ||
              'Expected value to not be empty.',
              formatArgs);
      }

      return value;
    };
}

module.exports.checkIsString = typeCheck('string');
module.exports.checkIsStringNotEmpty = typeCheckNotEmpty('string');
module.exports.checkIsArray = typeCheck('array');
module.exports.checkIsArrayNotEmpty = typeCheckNotEmpty('array');
module.exports.checkIsNumber = typeCheck('number');
module.exports.checkIsBoolean = typeCheck('boolean');
module.exports.checkIsFunction = typeCheck('function');
module.exports.checkIsObject = typeCheck('object');
module.exports.checkIsObjectNotEmpty = typeCheckNotEmpty('object');
