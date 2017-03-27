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

function _getInverseOperator(op) {

  switch (op) {
    case 'and':
      return 'not-or-not';
    case 'not-and':
      return 'or-not';
    case 'and-not':
      return 'not-or';
    case 'not-and-not':
      return 'or';
    case 'or':
      return 'not-and-not';
    case 'not-or':
      return 'and-not';
    case 'or-not':
      return 'not-and';
    case 'not-or-not':
      return 'and';
  }

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
      } else if (token.path.original =='pagebreak' && _.size(token.params) === 0) {
        return {
          type: 'statement',
          text: token.path.original,
          params: [],
          tokens: _.map(_.get(token, 'program.body'), _parseToken)
        };
      } else if (token.path.original == 'expand' && _.size(token.params) === 2) {
        return {
          type: 'statement',
          text: token.path.original,
          params: _.map(token.params, _parseToken),
          tokens: _.map(_.get(token, 'program.body'), _parseToken)
        }
      } else
        return _parseToken(token.path);
    case 'BlockStatement': {
      if (token.path.original == 'if' || token.path.original == 'unless') {
        if (token.inverse !== undefined) {
          return [{       // chen_debug (for the `else` statement)
            type: 'statement',
            text: token.path.original,
            params: _.map(token.params, _parseToken),
            tokens: _.map(_.get(token, 'program.body'), _parseToken)
          }, {
            type: 'statement',
            text: (token.path.original == 'if') ? 'unless' : 'if',
            params: _.map(token.params, _parseToken),
            tokens: _.map(_.get(token, 'inverse.body'), _parseToken)
          }];
        }
      }
      else if (token.path.original == 'ifVariant' || token.path.original == 'unlessVariant') {
        if (token.inverse !== undefined) {
          return [{       // chen_debug (for the `else` statement)
            type: 'statement',
            text: token.path.original,
            params: _.map(token.params, _parseToken),
            tokens: _.map(_.get(token, 'program.body'), _parseToken)
          }, {
            type: 'statement',
            text: (token.path.original == 'ifVariant') ? 'unlessVariant' : 'ifVariant',
            params: _.map(token.params, _parseToken),
            tokens: _.map(_.get(token, 'inverse.body'), _parseToken)
          }];
        }
      }
      else if (token.path.original == 'ifCond') {
        if (token.inverse !== undefined) {
          var inverseTokenParams = [
            token.params[0], 
            {
              'type': 'StringLiteral',
              'value': _getInverseOperator(token.params[1].value),
              'original': _getInverseOperator(token.params[1].original),
            },
            token.params[2]
          ];

          return [{       // chen_debug (for the `else` statement)
            type: 'statement',
            text: token.path.original,
            params: _.map(token.params, _parseToken),
            tokens: _.map(_.get(token, 'program.body'), _parseToken)
          }, {
            type: 'statement',
            text: token.path.original,
            params: _.map(inverseTokenParams, _parseToken),
            tokens: _.map(_.get(token, 'inverse.body'), _parseToken)
          }];
        }

        /*if (token.params[0].type == 'SubExpression') {
          var firstParams = token.params[0].params;
          firstParams[2] = firstParams[1]; firstParams[1] = firstParams[0];
          firstParams[0] = {
            'type' : token.params[0].path.type,
            'data' : token.params[0].path.data,
            'depth' : token.params[0].path.depth,
            'parts' : token.params[0].path.parts,
            'original' : token.params[0].path.original,
            'loc' : token.params[0].path.loc
          };
          token.params[0].path.original = 'ifCond';
        }*/
      }

      return {       // chen_debug (for the `else` statement)
        type: 'statement',
        text: token.path.original,
        params: _.map(token.params, _parseToken),
        tokens: _.map(_.get(token, 'program.body'), _parseToken)
      };
    }
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

  if (token.type === undefined) {     // chen_debug (if the token is array)
    return _.map(token, _getTokenParams);
  }
  else if (token.type === 'variable') {
    return token;
  }
  return []
    .concat(_.map(token.params, _getTokenParams))
    .concat(_.map(token.tokens, _getTokenParams));
}