'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var projectsSrvc   = require('../data-services/projects');
var validationUtil = require('../util/validations');

exports.getProjects = (req, res, next) => {
  projectsSrvc
    .getProjects({}, 'name')
    .then(projects => res.send(projects))
    .catch(next);
};

exports.getProjectById = (req, res, next) => {
  var projId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(projId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => projectsSrvc.getProject({ _id: projId }, '-__v'))
    .then(proj => res.send(proj))
    .catch(next);
};

exports.createProject = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'projectTemplate'];
    var projData = _.pick(body, allowedFields);
    return Promise.resolve(projData);
  }

  function validateParams(projData) {
    return _validateProjectData(projData);
  }

  function doEdits(projData) {
    var proj = _.assign({}, projData);
    return proj;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(proj => projectsSrvc.createProject(proj))
    .then(proj => res.send(proj))
    .catch(next);
};

exports.updateProject = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'projectTemplate', 'values'];
    var projData = _.pick(body, allowedFields);
    projData._id = req.params._id;
    return Promise.resolve(projData);
  }

  function validateParams(projData) {
    if (!validationUtil.isValidObjectId(projData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return _validateProjectData(projData);
  }

  function validateProjectValues(projData) {
    if (!projData.values) {
      return projData;
    }
    if (!_.isArray(projData.values)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'values', errMsg: 'must be a valid array' });
    }
    for (var i = 0; i < projData.values.length; i++) {
      var val = projData.values[i];
      if (!val.variable) {
        return customErrors.rejectWithUnprocessableRequestError(
          { paramName: 'values.variable', errMsg: 'must be defined' });
      }
    }
    return projData;
  }

  function doEdits(data) {
    _.extend(data.proj, data.projData);
    return data.proj;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(validateProjectValues)
    .then(projData => projectsSrvc
      .getProject({ _id: projData._id })
      .then(proj => {
        return { proj, projData };
      })
    )
    .then(doEdits)
    .then(proj => projectsSrvc.saveProject(proj))
    .then(proj => res.send(proj))
    .catch(next);
};

function _validateProjectData(projData) {
  if (!projData.name) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'name',
      errMsg: 'is required'
    });
  }
  if (!validationUtil.isValidObjectId(projData.projectTemplate)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'projectTemplate',
      errMsg: 'must be a valid id'
    });
  }
  return Promise.resolve(projData);
}
