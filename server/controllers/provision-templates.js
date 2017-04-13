'use strict';

var _               = require('lodash');
var Promise         = require('bluebird');
var customErrors    = require('n-custom-errors');
var consts          = require('../consts');
var docTemplsSrvc   = require('../data-services/document-templates');
var provisionTsSrvc = require('../data-services/provision-templates');
var termTsSrvc      = require('../data-services/term-templates');
var validationUtil  = require('../util/validations');
var templProc       = require('../util/template-processor');

exports.getProvisionTemplates = (req, res, next) => {
  function parseParams(query) {
    var data = {
      params: _.pick(query, ['query', 'includes', 'status'])
    };
    data.fields = req.query.fields || ['displayName', 'style', 'template', 'status'];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = ['displayName', 'style', 'template', 'templateHtml', 
          'termTemplates', 'orderedVariables', 'status'];

    if (data.params.includes && !_.every(data.params.includes, validationUtil.isValidObjectId)) {
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
    if (data.params.query) {
      data.filter.displayName = {
        $regex: new RegExp(data.params.query, 'i')
      };
    }
    if (data.params.status) {
      data.filter.status = {
        $eq: data.params.status
      };
    }
    if (data.params.includes) {
      data.filter._id = {
        $in: data.params.includes
      };
    }
    return data;
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => provisionTsSrvc.getProvisionTemplates(data.filter, data.fields.join(' ')))
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
    provisionTempl.status = 'active';
    return provisionTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(_parseTemplate)
    .then(doEdits)
    .then(provisionTempl => provisionTsSrvc.createProvisionTemplate(provisionTempl))
    .then(provisionTempl => res.send(provisionTempl))
    .catch(next);
};

exports.deleteProvisionTemplate = (req, res, next) => {
  var provisionTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(provisionTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  function checkTemplateUsed(provisionTempl) {
    return docTemplsSrvc
      .getDocumentTemplates({ provisionTemplates: provisionTemplId }, 'name')
      .then(docTempls => {
        if (!_.isEmpty(docTempls)) {
          var docTemplNames = _.map(docTempls, 'name').join(',');
          return customErrors.rejectWithUnprocessableRequestError({ 
            paramName: 'Provision template', 
            errMsg: 'was already used by document templates : ' + docTemplNames
          });
        }
        return Promise.resolve(provisionTempl);
      });
  }

  validateParams()
    .then(() => provisionTsSrvc.getProvisionTemplate({ _id: provisionTemplId }, '-__v'))
    .then(checkTemplateUsed)
    .then(provisionTsSrvc.deleteProvisionTemplate)
    .then(provisionTempl => res.send(true))
    .catch(next);
};

exports.updateProvisionTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['displayName', 'style', 'template', 'status'];
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
    .then(_parseTemplate)
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

function _parseTemplate(provisionTemplData) {
  return Promise
    .all([
      templProc.parse(provisionTemplData.template),
      termTsSrvc.getActiveTermTemplates({})
    ])
    .spread((tokensRoot, termTempls) => {
      return Promise
        .resolve()
        .then(() => templProc.validate(tokensRoot, termTempls))
        .then(() => templProc.generate(tokensRoot, termTempls))
        .then(html => {
          var variables = _.map(termTempls, 'variable');
          var usedVariables = templProc.getUsedVariables(tokensRoot, variables);
          var usedTermTempls = _.filter(termTempls, tt => _.includes(usedVariables, tt.variable));
          provisionTemplData.termTemplates = usedTermTempls;
          provisionTemplData.templateHtml = html;
          provisionTemplData.orderedVariables = usedVariables;
          return provisionTemplData;
        });
    });
}
