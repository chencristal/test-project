'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var termTsSrvc     = require('../data-services/term-templates');
var validationUtil = require('../util/validations');

exports.getTermTemplates = (req, res, next) => {
  function parseParams(query) {
    var data = {
      includes: query.includes
    };
    data.fields = req.query.fields || ['displayName'];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = ['*', 'termType', 'variable', 'text', 'boolean', 'variant', 'date', 'displayName', 'help'];

    if (data.includes && !_.every(data.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    if (!_.every(data.fields, field => _.includes(allowedFields, field))) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'fields',
        errMsg: 'must be an array with valid fields'
      });
    }
    return data;
  }

  function buildFilter(data) {
    data.filter = {};
    if (data.includes) {
      data.filter._id = {
        $in: data.includes
      };
    }
    if (_.get(data, 'fields[0]') === '*') {
      data.fields = ['-__v'];
    }
    return data;
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => termTsSrvc.getActiveTermTemplates(data.filter, data.fields.join(' ')))
    .then(termTempls => res.send(termTempls))
    .catch(next);
};

exports.getTermTemplateById = (req, res, next) => {
  var termTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(termTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => termTsSrvc.getTermTemplate({ _id: termTemplId }, '-__v'))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.createTermTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['termType', 'variable', 'displayName', 'help', 'text', 'boolean', 'variant', 'date'];
    var termTemplData = _.pick(body, allowedFields);
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    return _validateTermTemplData(termTemplData);
  }

  function doEdits(termTemplData) {
    var termTempl = _.assign({}, termTemplData);
    return termTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(termTempl => termTsSrvc.createTermTemplate(termTempl))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.updateTermTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['termType', 'variable', 'displayName', 'help', 'text', 'boolean', 'variant', 'date'];
    var termTemplData = _.pick(body, allowedFields);
    termTemplData._id = req.params._id;
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    if (!validationUtil.isValidObjectId(termTemplData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateTermTemplData(termTemplData);
  }

  function doEdits(data) {
    delete data.termTemplData.termType;
    delete data.termTemplData.variable;
    _.extend(data.termTempl, data.termTemplData);
    return data.termTempl;
  }

  parseParams(req.body)
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
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => termTsSrvc.deleteTermTemplateById(termTemplId))
    .then(() => res.status(203).end())
    .catch(next);
};

function _validateTermTemplData(termTemplData) {
  if (!_.includes(consts.TERM_TYPES, termTemplData.termType)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'termType', errMsg: 'must be defined and has a valid value' }
    );
  }
  if (!termTemplData.variable) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variable', errMsg: 'is required' }
    );
  }
  if (!termTemplData.displayName) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'displayName', errMsg: 'is required' }
    );
  }

  switch (termTemplData.termType) {
    case 'text':
      return validateTextTermType(termTemplData);
    case 'boolean':
      return validateBooleanTermType(termTemplData);
    case 'variant':
      return validateVariantTermType(termTemplData);
  }

  return Promise.resolve(termTemplData);
}

function validateTextTermType(termTemplData) {
  if (!_.get(termTemplData, 'text.placeholder')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'text.placeholder', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}

function validateBooleanTermType(termTemplData) {
  if (!_.get(termTemplData, 'boolean.inclusionText')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.inclusionText', errMsg: 'is required' }
    );
  }
  if (!_.get(termTemplData, 'boolean.exclusionText')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.exclusionText', errMsg: 'is required' }
    );
  }
  var def = _.get(termTemplData, 'boolean.default');
  if (!_.isBoolean(def)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.default', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}

function validateVariantTermType(termTemplData) {
  var opts = _.get(termTemplData, 'variant.options');
  var defValue = _.get(termTemplData, 'variant.default');

  if (!_.isArray(opts) || opts.length === 0) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.options', errMsg: 'must be not empty array' }
    );
  }
  var optValues = _(opts).map('value').uniq().value();
  if (optValues.length !== opts.length) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.options', errMsg: 'shouldn\'t have duplicates' }
    );
  }
  if (!_.includes(optValues, defValue)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.default', errMsg: 'must be defined and matched with one of the options' }
    );
  }
  if (!_.get(termTemplData, 'variant.displayAs')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.displayAs', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}
