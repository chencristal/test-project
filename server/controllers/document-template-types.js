'use strict';

var _                 = require('lodash');
var Promise           = require('bluebird');
var customErrors      = require('n-custom-errors');
var docTemplTypesSrvc = require('../data-services/document-template-types');
var validationUtil    = require('../util/validations');

exports.getDocumentTemplateTypes = (req, res, next) => {
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
    .then(filter => docTemplTypesSrvc.getDocumentTemplateTypes(filter, 'name'))
    .then(docTemplTypes => res.send(docTemplTypes))
    .catch(next);
};

exports.getDocumentTemplateTypeById = (req, res, next) => {
  var docTemplTypeId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(docTemplTypeId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => docTemplTypesSrvc.getDocumentTemplateType({ _id: docTemplTypeId }, '-__v'))
    .then(docTemplType => res.send(docTemplType))
    .catch(next);
};

exports.createDocumentTemplateType = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'description'];
    var docTemplTypeData = _.pick(body, allowedFields);
    return Promise.resolve(docTemplTypeData);
  }

  function validateParams(docTemplTypeData) {
    return _validateDocumentTemplateTypeData(docTemplTypeData);
  }

  function doEdits(docTemplTypeData) {
    var docTemplType = _.assign({}, docTemplTypeData);
    return docTemplType;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(docTemplType => docTemplTypesSrvc.createDocumentTemplateType(docTemplType))
    .then(docTemplType => res.send(docTemplType))
    .catch(next);
};

exports.updateDocumentTemplateType = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'description'];
    var docTemplTypeData = _.pick(body, allowedFields);
    docTemplTypeData._id = req.params._id;
    return Promise.resolve(docTemplTypeData);
  }

  function validateParams(docTemplTypeData) {
    if (!validationUtil.isValidObjectId(docTemplTypeData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateDocumentTemplateTypeData(docTemplTypeData);
  }

  function doEdits(data) {
    _.extend(data.docTemplType, data.docTemplTypeData);
    return data.docTemplType;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(docTemplTypeData => docTemplTypesSrvc
      .getDocumentTemplateType({ _id: docTemplTypeData._id })
      .then(docTemplType => {
        return { docTemplType, docTemplTypeData };
      })
    )
    .then(doEdits)
    .then(docTemplType => docTemplTypesSrvc.saveDocumentTemplateType(docTemplType))
    .then(docTemplType => res.send(docTemplType))
    .catch(next);
};

function _validateDocumentTemplateTypeData(docTemplTypeData) {
  if (!docTemplTypeData.name) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'name', errMsg: 'is required' }
    );
  }
  return Promise.resolve(docTemplTypeData);
}
