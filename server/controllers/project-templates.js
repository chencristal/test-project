'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var projTemplsSrvc = require('../data-services/project-templates');
var validationUtil = require('../util/validations');

exports.getProjectTemplates = (req, res, next) => {
  function parseParams(query) {
    var params = {
      query: query.query,
      includes: query.includes
    };
    return Promise.resolve(params);
  }

  function validateParams(params) {
    if (params.includes && !_.every(params.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    return params;
  }

  function buildFilter(params) {
    var filter = {};
    if (params.query) {
      filter.name = {
        $regex: new RegExp(params.query, 'i')
      };
    }
    if (params.includes) {
      filter._id = {
        $in: params.includes
      };
    }
    return filter;
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(filter => projTemplsSrvc.getProjectTemplates(filter, 'name'))
    .then(projTempls => res.send(projTempls))
    .catch(next);
};

exports.getProjectTemplateById = (req, res, next) => {
  var projTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(projTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => projTemplsSrvc.getProjectTemplate({ _id: projTemplId }, '-__v'))
    .then(projTempl => res.send(projTempl))
    .catch(next);
};

exports.createProjectTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'documentTemplates'];
    var projTemplData = _.pick(body, allowedFields);
    return Promise.resolve(projTemplData);
  }

  function validateParams(projTemplData) {
    return _validateProjectTemplateData(projTemplData);
  }

  function doEdits(projTemplData) {
    var projTempl = _.assign({}, projTemplData);
    return projTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(projTempl => projTemplsSrvc.createProjectTemplate(projTempl))
    .then(projTempl => res.send(projTempl))
    .catch(next);
};

exports.updateProjectTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'documentTemplates'];
    var projTemplData = _.pick(body, allowedFields);
    projTemplData._id = req.params._id;
    return Promise.resolve(projTemplData);
  }

  function validateParams(projTemplData) {
    if (!validationUtil.isValidObjectId(projTemplData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateProjectTemplateData(projTemplData);
  }

  function doEdits(data) {
    _.extend(data.projTempl, data.projTemplData);
    return data.projTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(projTemplData => projTemplsSrvc
      .getProjectTemplate({ _id: projTemplData._id })
      .then(projTempl => {
        return { projTempl, projTemplData };
      })
    )
    .then(doEdits)
    .then(projTempl => projTemplsSrvc.saveProjectTemplate(projTempl))
    .then(projTempl => res.send(projTempl))
    .catch(next);
};

function _validateProjectTemplateData(projTemplData) {
  if (!projTemplData.name) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'name',
      errMsg: 'is required'
    });
  }
  if (!_.isArray(projTemplData.documentTemplates) ||
      projTemplData.documentTemplates.length === 0 ||
      !_.every(projTemplData.documentTemplates, validationUtil.isValidObjectId)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'documentTemplates',
      errMsg: 'must be an array with valid ids'
    });
  }
  return Promise.resolve(projTemplData);
}
