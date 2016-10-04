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
  if (token.type === 'MustacheStatement' && token.path.type === 'PathExpression') {
    this.validateParam.call(this, token.path.text);
  } else if (token.type === 'BlockStatement' && token.path.type === 'PathExpression') {
    this.validateExp.call(this, token.path.text, token.params);
  }

  this.validateToken.call(this, token.path);
  this.validateToken.call(this, token.program);
  _.each(token.params, this.validateToken.bind(this));
  _.each(token.body, this.validateToken.bind(this));
};

Validator.prototype.validateParam = function(param) {
  if (!_.includes(this.allowableParams, param)) {
    throw customErrors.getUnprocessableRequestError(
      `Unexpected token: ${param}`);
  }
};

Validator.prototype.validateIfExpLiteral = function(literal) {
  if (!_.includes(consts.IF_LITERALS, literal)) {
    throw customErrors.getUnprocessableRequestError(
      `Unexpected ifCond literal: ${literal}`);
  }
};

Validator.prototype.validateExp = function(exp, params) {
  var self = this;
  if (!_.includes(consts.EXPRESSIONS, exp)) {
    throw customErrors.getUnprocessableRequestError(
      `Uknown expression: ${exp}`);
  }

  var paramsRequired = (exp === 'if' || exp === 'unless') ? 1 : 3;
  if (params.length !== paramsRequired) {
    throw customErrors.getUnprocessableRequestError(
      `Expected ${paramsRequired} parameters in expression, got ${params.length}`);
  }

  if (exp === 'ifCond') {
    if (params[0].type !== 'StringLiteral') {
      throw customErrors.getUnprocessableRequestError(
        `Expected an operator (and, and-not, etc), got ${params[0].type}`);
    }
    self.validateIfExpLiteral.call(self, params[0].text);
  }

  _(params)
    .tail()
    .each(param => {
      if (param.type !== 'PathExpression') {
        throw customErrors.getUnprocessableRequestError(
          `Expected a parameter, got ${param.type}`);
      }
      return self.validateParam.call(self, param.text);
    });

  // TODO trow error
};
