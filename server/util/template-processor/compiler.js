'use strict';

var handlebars   = require('handlebars');
var Promise      = require('bluebird');
var customErrors = require('n-custom-errors');

exports.compile = templ => {
  return _hbCompile(templ)
    .catch(err => customErrors.rejectWithUnprocessableRequestError('Invalid template: ' + err));
};

function _hbCompile(templ) {
  return new Promise((resolve, reject) => {
    try {
      var coimpiled = handlebars.compile(templ);
      resolve(coimpiled);
    } catch (err) {
      reject(err);
    }
  });
}
