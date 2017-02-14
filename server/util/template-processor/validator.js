'use strict';

var _            = require('lodash');
var Promise      = require('bluebird');
var customErrors = require('n-custom-errors');
var consts       = require('../../consts').HANDLEBAR;

exports.validate = (tokensRoot, variables) => {
  return new Promise((resolve, reject) => {
    try {
      var validator = new Validator(variables);
      validator.validateToken(tokensRoot);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

function Validator(allowedVariables) {
  this.allowedVariables = allowedVariables;
}

Validator.prototype.validateToken = function(token) {
  if (!token) {
    return null;
  }

  switch (token.type) {
    case 'statement':
      this.validateStatement.call(this, token.text, token.params);
      break;
    case 'variable':
      this.validateParam.call(this, token.text);
      break;
  }

  _.each(token.tokens, this.validateToken.bind(this));
};

Validator.prototype.validateParam = function(param) {
  if (!_.some(this.allowedVariables, { variable: param })) {
    throw customErrors.getUnprocessableRequestError(`Unknown token: ${param}`);
  }
};

Validator.prototype.validateParams = function(params) {
  var self = this;

  _(params)
    .each(param => {
      if (param.type !== 'variable') {
        throw customErrors.getUnprocessableRequestError(`Expected a parameter, got ${param.type}`);
      }
      return self.validateParam.call(self, param.text);
    });
};

Validator.prototype.validateStatement = function(statement, params) {
  if (!_.includes(consts.STATEMENTS, statement)) {
    throw customErrors.getUnprocessableRequestError(`Uknown statement: ${statement}`);
  }

  var requiredParamsCount;
  switch (statement) {
    case 'if':
    case 'unless':
      requiredParamsCount = 1;
      break;
    case 'ifCond':
      requiredParamsCount = 3;
      break;
    case 'math':
      requiredParamsCount = 3;
      break;
    case 'ifVariant':
      requiredParamsCount = 2;
      break;
    case 'date':
      requiredParamsCount = 1;
      break;
    default:
      requiredParamsCount = 0;
      break;
  }
  if (params.length !== requiredParamsCount) {
    throw customErrors.getUnprocessableRequestError(
      `Expected ${requiredParamsCount} parameters in statement, got ${params.length}`);
  }

  if (statement === 'ifCond') {
    this.validateIfCondOperator.call(this, params[0].type, params[0].text);
    params = _.tail(params);
  } else if (statement === 'ifVariant') {
    params = _.take(params, 1);
  } else if (statement === 'math') {  // chen_debug
    this.validateMathCondOperator.call(this, params[1].type, params[1].text);
    params = _.filter(params, _.iteratee(['type', 'variable']));
    // params = _.tail(params);
  }

  this.validateParams.call(this, params);
};

Validator.prototype.validateIfCondOperator = function(type, operator) {
  if (type !== 'operator') {
    throw customErrors.getUnprocessableRequestError(
      `Expected an operator (and, and-not, etc), got ${type}`);
  }
  if (!_.includes(consts.IFCOND_OPERATORS, operator)) {
    throw customErrors.getUnprocessableRequestError(`Unexpected ifCond operator: ${operator}`);
  }
};

// chen_debug
Validator.prototype.validateMathCondOperator = function(type, operator) {
  if (type !== 'operator') {
    throw customErrors.getUnprocessableRequestError(
      `Expected an operator (add, subtract, etc), got ${type}`);
  }
  if (!_.includes(consts.MATH_OPERATORS, operator)) {
    throw customErrors.getUnprocessableRequestError(`Unexpected math operator: ${operator}`);
  }
};