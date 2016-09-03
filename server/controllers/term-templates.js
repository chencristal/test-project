'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var termTsSrvc     = require('../data-services/term-templates');
var validationUtil = require('../util/validation-util');

exports.getTermTemplates = (req, res, next) => {
  termTsSrvc
    .getActiveTermTemplates({}, 'displayName termType variable')
    .then(termTempls => res.send(termTempls))
    .catch(next);
};

exports.getTermTemplateById = (req, res, next) => {
  var termTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(termTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id'});
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => termTsSrvc.getTermTemplate({ _id: termTemplId }, '-__v'))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

// TODO: validate boolean and date variables
exports.createTermTemplate = (req, res, next) => {
  function parseParams() {
    var allowedFields = ['termType', 'variable', 'displayName', 'placeholder', 'help'];
    var termTemplData = _.pick(req.body, allowedFields);
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    return _validateTermTemplData(termTemplData);
  }

  function doEdits(termTemplData) {
    var termTempl = _.assign({}, termTemplData);
    return termTempl;
  }

  parseParams()
    .then(validateParams)
    .then(doEdits)
    .then(termTempl => termTsSrvc.createTermTemplate(termTempl))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

// TODO: validate boolean and date variables
exports.updateTermTemplate = (req, res, next) => {
  function parseParams() {
    var allowedFields = ['termType', 'variable', 'displayName', 'placeholder', 'help'];
    var termTemplData = _.pick(req.body, allowedFields);
    termTemplData._id = req.params._id;
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    if (!validationUtil.isValidObjectId(termTemplData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({paramName: 'id', errMsg: 'must be a valid id'});
    }
    return _validateTermTemplData(termTemplData);
  }

  function doEdits(data) {
    _.extend(data.termTempl, data.termTemplData);
    return data.termTempl;
  }

  parseParams()
    .then(validateParams)
    .then(termTemplData => termTsSrvc
      .getTermTemplate({ _id: termTemplData._id })
      .then(termTempl => {
        return { termTempl, termTemplData };
      })
    )
    .then(doEdits)
    .then(termTempl => termTsSrvc.saveTermTemplate(termTempl))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.deleteTermTemplate = (req, res, next) => {
  var termTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(termTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id'});
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => termTsSrvc.deleteTermTemplateById(termTemplId))
    .then(() => res.status(203).end())
    .catch(next);
};

function _validateTermTemplData(termTemplData) {
  if (!termTemplData.termType) {
    return customErrors.rejectWithUnprocessableRequestError({paramName: 'termType', errMsg: 'is required'});
  }
  if (!termTemplData.variable) {
    return customErrors.rejectWithUnprocessableRequestError({paramName: 'variable', errMsg: 'is required'});
  }
  if (!termTemplData.displayName) {
    return customErrors.rejectWithUnprocessableRequestError({paramName: 'displayName', errMsg: 'is required'});
  }
  if (!termTemplData.placeholder) {
    return customErrors.rejectWithUnprocessableRequestError({paramName: 'placeholder', errMsg: 'is required'});
  }
  return Promise.resolve(termTemplData);
}