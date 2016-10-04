'use strict';

var _            = require('lodash');
var Promise      = require('bluebird');
var customErrors = require('n-custom-errors');
var consts       = require('../../consts').HANDLEBAR;

exports.validate = (tokensRoot, params) => {
  return new Promise((resolve, reject) => {
    try {
      var validator = new Validator(params);
      validator.validateToken(tokensRoot);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

function Validator(allowableParams) {
  this.allowableParams = allowableParams;
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
  if (!_.includes(this.allowableParams, param)) {
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

Validator.prototype.validateIfCondOperator = function(type, operator) {
  if (type !== 'operator') {
    throw customErrors.getUnprocessableRequestError(
      `Expected an operator (and, and-not, etc), got ${type}`);
  }
  if (!_.includes(consts.IFCOND_OPERATORS, operator)) {
    throw customErrors.getUnprocessableRequestError(`Unexpected ifCond operator: ${operator}`);
  }
};

Validator.prototype.validateStatement = function(statement, params) {
  if (!_.includes(consts.STATEMENTS, statement)) {
    throw customErrors.getUnprocessableRequestError(`Uknown statement: ${statement}`);
  }

  var requiredParamsCount = (statement === 'if' || statement === 'unless') ? 1 : 3;
  if (params.length !== requiredParamsCount) {
    throw customErrors.getUnprocessableRequestError(
      `Expected ${requiredParamsCount} parameters in statement, got ${params.length}`);
  }

  if (statement === 'ifCond') {
    this.validateIfCondOperator.call(this, params[0].type, params[0].text);
    params = _.tail(params);
  }

  this.validateParams.call(this, params);
};
