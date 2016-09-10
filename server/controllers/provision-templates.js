'use strict';

var _               = require('lodash');
var Promise         = require('bluebird');
var customErrors    = require('n-custom-errors');
var consts          = require('../consts');
var provisionTsSrvc = require('../data-services/provision-templates');
var validationUtil  = require('../util/validation-util');

exports.getProvisionTemplates = (req, res, next) => {
  provisionTsSrvc
    .getProvisionTemplates({}, 'displayName')
    .then(provisionTempls => res.send(provisionTempls))
    .catch(next);
};

exports.getProvisionTemplateById = (req, res, next) => {
  var provisionTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(provisionTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => provisionTsSrvc.getProvisionTemplate({ _id: provisionTemplId }, '-__v'))
    .then(provisionTempl => res.send(provisionTempl))
    .catch(next);
};

exports.createProvisionTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['displayName', 'style', 'template'];
    var provisionTemplData = _.pick(body, allowedFields);
    return Promise.resolve(provisionTemplData);
  }

  function validateParams(provisionTemplData) {
    return _validateProvisionTemplateData(provisionTemplData);
  }

  function doEdits(provisionTemplData) {
    var provisionTempl = _.assign({}, provisionTemplData);
    return provisionTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(provisionTempl => provisionTsSrvc.createProvisionTemplate(provisionTempl))
    .then(provisionTempl => res.send(provisionTempl))
    .catch(next);
};

exports.updateProvisionTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['displayName', 'style', 'template'];
    var provisionTemplData = _.pick(body, allowedFields);
    provisionTemplData._id = req.params._id;
    return Promise.resolve(provisionTemplData);
  }

  function validateParams(provisionTemplData) {
    if (!validationUtil.isValidObjectId(provisionTemplData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateProvisionTemplateData(provisionTemplData);
  }

  function doEdits(data) {
    _.extend(data.provisionTempl, data.provisionTemplData);
    return data.provisionTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(provisionTemplData => provisionTsSrvc
      .getProvisionTemplate({ _id: provisionTemplData._id })
      .then(provisionTempl => {
        return { provisionTempl, provisionTemplData };
      })
    )
    .then(doEdits)
    .then(provisionTempl => provisionTsSrvc.saveProvisionTemplate(provisionTempl))
    .then(provisionTempl => res.send(provisionTempl))
    .catch(next);
};

function _validateProvisionTemplateData(provisionTemplData) {
  if (!provisionTemplData.displayName) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'displayName', errMsg: 'is required' }
    );
  }
  if (!_.includes(consts.PROVISION_STYLES, provisionTemplData.style)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'style', errMsg: 'must be defined and has a valid value' }
    );
  }
  if (!provisionTemplData.template) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'template', errMsg: 'is required' }
    );
  }
  return Promise.resolve(provisionTemplData);
}
