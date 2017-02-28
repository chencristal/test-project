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

exports.getViewedVariables = (templ, values) => {   // chen_debug
  return _hbParse(templ)
    .then(_parseToken)
    .then(tokensRoot => _parseTokenWithValues(tokensRoot, values))
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

    console.log(usedVariables);
  return usedVariables;
};

function _hbParse(templ) {
  return new Promise((resolve, reject) => {
    try {
      var rootToken = handlebars.parse(templ);
      // console.log(JSON.stringify(rootToken));
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

function _parseTokenWithValues(token, values) {   // chen_debug
  var _variables = [];

  function _parseBoolean(text) {
    var _temp = _.find(values, {'variable': text});

    if (_temp !== undefined) {
      if (_temp.value == 'true' || _temp.value == true) {
        return true;
      }
    }

    return false;
  }
  function _parseIfCond(token) {
    var op = token.params[0].text,
        v1 = _parseBoolean(token.params[1].text),
        v2 = _parseBoolean(token.params[2].text);

    switch (op) {
      case 'and':
        return (v1 && v2);
      case 'not-and':
        return (!v1 && v2);
      case 'and-not':
        return (v1 && !v2);
      case 'not-and-not':
        return (!v1 && !v2);
      case 'or':
        return (v1 || v2);
      case 'not-or':
        return (!v1 || v2);
      case 'or-not':
        return (v1 || !v2);
      case 'not-or-not':
        return (!v1 || !v2);
      default:
        return false;
    }
  }

  function _parseValues(token) {
    if (!token) {
      return '';
    }

    if (token.type === undefined) {     // chen_debug (if the token is array)
      _.map(token, _parseValues);
    }
    else {
      switch (token.type) {
        case 'program':
          _.map(token.tokens, _parseValues);
        case 'variable': {
          var _temp = _.find(values, {'variable': token.text});
          if (_.find(_variables, _temp) == undefined) {
            _variables = _.concat(_variables, _temp);
          }
        }
        case 'statement': {
          if (token.text == 'if') {
            var _temp = _.find(values, {'variable': token.params[0].text});
            if (_.find(_variables, _temp) == undefined)
              _variables = _.concat(_variables, _temp);

            if (_parseBoolean(token.params[0].text) == true) {
              _.map(token.tokens,  _parseValues);
            }
          }
          else if (token.text == 'unless') {
            var _temp = _.find(values, {'variable': token.params[0].text});
            if (_.find(_variables, _temp) == undefined)
              _variables = _.concat(_variables, _temp);

            if (_parseBoolean(token.params[0].text) == false) {
              _.map(token.tokens,  _parseValues);
            }
          }
          else if (token.text == 'math') {
            _.forEach(token.params, function(param) {
              if (param.type == 'variable') {
                var _temp = _.find(values, {'variable': param.text});
                if (_.find(_variables, _temp) == undefined) {
                  _variables = _.concat(_variables, _temp);
                }
              }
            });
          }
          else if (token.text == 'ifVariant') {
            _.forEach(token.params, function(param) {
              if (param.type == 'variable') {
                var _temp = _.find(values, {'variable': param.text});
                if (_.find(_variables, _temp) == undefined) {
                  _variables = _.concat(_variables, _temp);
                }
              }
            });
          }
          else if (token.text == 'ifCond') {
            _.forEach(token.params, function(param) {
              if (param.type == 'variable') {
                var _temp = _.find(values, {'variable': param.text});
                if (_.find(_variables, _temp) == undefined) {
                  _variables = _.concat(_variables, _temp);
                }
              }
            });

            if (_parseIfCond(token) == true) {
              _.map(token.tokens, _parseValues);
            }
          }
        }
      } // END of switch
    }
    
  }

  _parseValues(token);

  return _variables;
}