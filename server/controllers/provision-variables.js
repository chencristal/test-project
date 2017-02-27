'use strict';

var _               = require('lodash');
var Promise         = require('bluebird');
var customErrors    = require('n-custom-errors');
var consts          = require('../consts');
var projectsSrvc    = require('../data-services/projects');
var provisionTsSrvc = require('../data-services/provision-templates');
var termTsSrvc      = require('../data-services/term-templates');
var validationUtil  = require('../util/validations');
var templProc       = require('../util/template-processor');

exports.getProvisionVariables = (req, res, next) => {
  function parseParams(query) {
    var data = {
      params: _.pick(query, ['query', 'includes', 'project'])
    };
    return Promise.resolve(data);
  }

  function validateParams(data) {
    if (data.params.includes && !_.every(data.params.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    if (data.params.project && !validationUtil.isValidObjectId(data.params.project)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'project',
        errMsg: 'must be a valid id'
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
    .then(_parseProvisionVariable)
    .then(data => res.send(data))
    .catch(next);
};

function _parseProvisionVariable(data) {
  var _project = data.params.project;

  return Promise
    .all([
      projectsSrvc.getProject({ _id: _project }, '-__v'),
      provisionTsSrvc.getProvisionTemplates(data.filter, 'displayName style template')
    ])
    .spread((project, provisionTemplData) => {
      return Promise
        .resolve()
        .then(() => templProc.getViewedVariables(provisionTemplData[0].template, project.values));
    });
}