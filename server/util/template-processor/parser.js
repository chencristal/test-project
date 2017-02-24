'use strict';

var _            = require('lodash');
var handlebars   = require('handlebars');
var Promise      = require('bluebird');
var customErrors = require('n-custom-errors');

exports.parse = templ => {
  return _hbParse(templ)
    .then(_parseToken)
    .catch(err => customErrors.rejectWithUnprocessableRequestError(err.message));
};

exports.getUsedVariables = (tokensRoot, variables) => {
  var params = _getTokenParams(tokensRoot);
  var usedVariables = _(params)
    .flattenDeep()
    .map('text')
    .uniq()
    .filter(paramName => _.includes(variables, paramName))
    .value();

  return usedVariables;
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

  switch (token.type) {
    case 'Program':
      return {
        type: 'program',
        tokens: _.map(token.body, _parseToken)
      };
    case 'ContentStatement':
      return {
        type: 'content',
        text: token.original
      };
    case 'MustacheStatement':
      if (token.path.original === 'math' && _.size(token.params) === 3) {  // chen_debug
        return {
          type: 'statement',
          text: token.path.original,
          params: _.map(token.params, _parseToken),
          tokens: _.map(_.get(token, 'program.body'), _parseToken)
        };
      } else if (token.path.original === 'case' && _.size(token.params) === 2) {
        return {
          type: 'statement',
          text: token.path.original,
          params: _.map(token.params, _parseToken),
          tokens: _.map(_.get(token, 'program.body'), _parseToken)
        };
      } else if (token.path.original === 'article' && _.size(token.params) === 1) {
        return {
          type: 'statement',
          text: token.path.original,
          params: _.map(token.params, _parseToken),
          tokens: _.map(_.get(token, 'program.body'), _parseToken)
        };
      } else 
        return _parseToken(token.path);
    case 'BlockStatement':
      return {
        type: 'statement',
        text: token.path.original,
        params: _.map(token.params, _parseToken),
        tokens: _.map(_.get(token, 'program.body'), _parseToken)
      };
    case 'StringLiteral':
      return {
        type: 'operator',
        text: token.original
      };
    case 'PathExpression':
      return {
        type: 'variable',
        text: token.original
      };
    case 'NumberLiteral':
      return {
        type: 'constant',
        text: token.value
      }
    default:
      throw new Error('Invalid token type: ' + token.type);
  }
}

function _getTokenParams(token) {
  if (!token) {
    return null;
  }
  if (token.type === 'variable') {
    return token;
  }
  return []
    .concat(_.map(token.params, _getTokenParams))
    .concat(_.map(token.tokens, _getTokenParams));
}
