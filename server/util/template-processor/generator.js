'use strict';

var _       = require('lodash');
var Promise = require('bluebird');

// TODO: used?
exports.generateHtml = tokensRoot => {
  var html = _generateHtml(tokensRoot);
  return Promise.resolve(html);
};

function _generateHtml(token) {
  if (!token || !token.type) {
      return '';
  }

  switch (token.type) {
    case 'ContentStatement':
      return token.text || '';
    case 'Program':
      return _.map(token.body, _generateHtml).join('');
    case 'MustacheStatement':
      return _generateHtml(token.path);
    case 'BlockStatement':
      return '<span ' + _generateExpHtml(token) + '>' +
        _generateHtml(token.program) +
        '</span>';
    case 'PathExpression':
      return `{{ ${token.text} }}`;
    default:
      throw new Error('Uknown type: ' + token.type);
  }
}

function _generateExpHtml(token) {
  var val = '';
  switch (token.path.text) {
    case 'if':
      val += token.params[0].text; // TODO: danger?
      break;
    case 'unless':
      val += '!' + token.params[0].text; // TODO: danger?
      break;
    case 'ifCond':
      val += token.params[0].text + '(';
      val += _(token.params)
        .tail()
        .map(param => param.text)
        .value()
        .join(',');
      val += ')';
      break;
  }

  return `ng-show="${val}"`;
}