'use strict';

var _            = require('lodash');
var handlebars   = require('handlebars');
var Promise      = require('bluebird');
var customErrors = require('n-custom-errors');

exports.parse = templ => {
  return _hbParse(templ)
    .then(_parseToken)
    .catch(err => customErrors.rejectWithUnprocessableRequestError('Invalid template: ' + err));
};

function _hbParse(templ) {
  return new Promise((resolve, reject) => {
    try {
      var rootToken = handlebars.parse(templ);
      resolve(rootToken);
    } catch (err) {
      reject(err);
    }
  });
}

function _parseToken(token) {
  if (!token) {
    return null;
  }
  return {
    group: token.group,
    type: token.type,
    text: token.original,
    path: _parseToken(token.path),
    program: _parseToken(token.program),
    params: _.map(token.params, _parseToken),
    body: _.map(token.body, _parseToken),
  };
}
