'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var docTemplsSrvc  = require('../data-services/document-templates');
var validationUtil = require('../util/validation-util');

exports.getDocumentTemplates = (req, res, next) => {
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
        $regex: new RegExp('^' + params.query, 'i')
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
    .then(filter => docTemplsSrvc.getDocumentTemplates(filter, 'name'))
    .then(docTempls => res.send(docTempls))
    .catch(next);
};

exports.getDocumentTemplateById = (req, res, next) => {
  var docTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(docTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => docTemplsSrvc.getDocumentTemplate({ _id: docTemplId }, '-__v'))
    .then(docTempl => res.send(docTempl))
    .catch(next);
};

exports.createDocumentTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'documentType', 'provisionTemplates'];
    var docTemplData = _.pick(body, allowedFields);
    return Promise.resolve(docTemplData);
  }

  function validateParams(docTemplData) {
    return _validateDocumentTemplateData(docTemplData);
  }

  function doEdits(docTemplData) {
    var docTempl = _.assign({}, docTemplData);
    return docTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(docTempl => docTemplsSrvc.createDocumentTemplate(docTempl))
    .then(docTempl => res.send(docTempl))
    .catch(next);
};

exports.updateDocumentTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'documentType', 'provisionTemplates'];
    var docTemplData = _.pick(body, allowedFields);
    docTemplData._id = req.params._id;
    return Promise.resolve(docTemplData);
  }

  function validateParams(docTemplData) {
    if (!validationUtil.isValidObjectId(docTemplData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateDocumentTemplateData(docTemplData);
  }

  function doEdits(data) {
    _.extend(data.docTempl, data.docTemplData);
    return data.docTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(docTemplData => docTemplsSrvc
      .getDocumentTemplate({ _id: docTemplData._id })
      .then(docTempl => {
        return { docTempl, docTemplData };
      })
    )
    .then(doEdits)
    .then(docTempl => docTemplsSrvc.saveDocumentTemplate(docTempl))
    .then(docTempl => res.send(docTempl))
    .catch(next);
};

function _validateDocumentTemplateData(docTemplData) {
  if (!docTemplData.name) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'name',
      errMsg: 'is required'
    });
  }
  if (!validationUtil.isValidObjectId(docTemplData.documentType)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'documentType',
      errMsg: 'must be a valid id'
    });
  }
  if (!_.isArray(docTemplData.provisionTemplates) ||
      docTemplData.provisionTemplates.length === 0 ||
      !_.every(docTemplData.provisionTemplates, validationUtil.isValidObjectId)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'provisionTemplates',
      errMsg: 'must be an array with valid ids'
    });
  }
  return Promise.resolve(docTemplData);
}
