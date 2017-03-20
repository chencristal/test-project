'use strict';

var _                 = require('lodash');
var Promise           = require('bluebird');
var customErrors      = require('n-custom-errors');
var moment            = require('moment');
var projectsSrvc      = require('../data-services/projects');
var docTemplTypesSrvc = require('../data-services/document-template-types');
var provisionTsSrvc   = require('../data-services/provision-templates');
var termTsSrvc        = require('../data-services/term-templates');
var validationUtil    = require('../util/validations');
var templProc         = require('../util/template-processor');
var pdfConverter      = require('../util/converters/pdf');
var wordConverter     = require('../util/converters/word');
var usersSrvc         = require('../data-services/users');

exports.getProjects = (req, res, next) => {
  projectsSrvc
    .getProjects({}, 'name')
    .then(projects => res.send(projects))
    .catch(next);
};

exports.getUserProjects = (req, res, next) => {
  usersSrvc
    .getUser({email: req.user.email})
    .then(user => {
      if (req.query.type === 'shared')
        return projectsSrvc.getSharedProjects(user);
      else
        return projectsSrvc.getUserProjects(user);
    })
    .then(projects => res.send(projects))
    .catch(next);
};

exports.getProjectById = (req, res, next) => {
  var projId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(projId)) {
      return customErrors.rejectWithUnprocessableRequestError(
        { paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  function checkOwner(proj) {
    return usersSrvc
      .getUser({email: req.user.email, _id: proj.owner})
      .then(user => {
        return Promise.resolve(proj);
      })
  }

  validateParams()
    .then(() => projectsSrvc.getProject({ _id: projId }, '-__v'))
    .then(proj => res.send(proj))
    .catch(next);
};

exports.createProject = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'projectTemplate', 'sharedUsers', 'sharedUserGroups'];
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
    .then(proj => {
      return usersSrvc
        .getUser({email: req.user.email})
        .then(user => {
          if (user.role === 'user')
            return _.assign(proj, {owner: user._id});
          else
            return customErrors.rejectWithUnprocessableRequestError(
              { paramName: 'Only users', errMsg: 'can save the project' });
        });
    })
    .then(doEdits)
    .then(proj => projectsSrvc.createProject(proj))
    .then(proj => res.send(proj))
    .catch(next);
};

exports.updateProject = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['name', 'projectTemplate', 'values', 'sharedUsers', 'sharedUserGroups'];
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

  function checkOwner(proj) {
    return usersSrvc
      .getUser({email: req.user.email, _id: proj.owner})
      .then(user => {
        return Promise.resolve(proj);
      })
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

exports.deleteProject = (req, res, next) => {
  var projId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(projId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => projectsSrvc.getProject({ _id: projId }, '-__v'))
    .then(proj => projectsSrvc.deleteProject(proj))
    .then(projects => res.send(true))
    .catch(next);
};

exports.generatePdf = (req, res, next) => {
  function parseParams(params) {
    return Promise.resolve({
      projId: params.projectId,
      docId: params.docId
    });
  }

  parseParams(req.params)
    .then(_getCompiledTemplate)
    .then(text => {
      text = text.replace(/\n/g,'<br/>');
      res.setHeader('Content-disposition', 'attachment; filename=converted.pdf');
      res.setHeader('Content-type', 'application/pdf');
      return pdfConverter.write(text, res);
    })
    .catch(next);
};

exports.generateWord = (req, res, next) => {
  function parseParams(params) {
    return Promise.resolve({
      projId: params.projectId,
      docId: params.docId,
      docTypeId: params.docTypeId
    });
  }

  parseParams(req.params)
    .then(_getCompiledTemplate)
    .then(text => {
      if (!validationUtil.isValidObjectId(req.params.docTypeId)) {
        return customErrors.rejectWithUnprocessableRequestError({ paramName: 'docTypeId', errMsg: 'must be a valid id' });
      }
      docTemplTypesSrvc.getDocumentTemplateType({_id: req.params.docTypeId}, 'styles')
      .then(docTemplType => {
        var styles = docTemplType.styles ? JSON.parse(docTemplType.styles) : {};
        res.setHeader('Content-disposition', 'attachment; filename=converted.docx');
        res.setHeader('Content-type', 'application/docx');
        return wordConverter.write(text, styles, res);  
      })
      .catch(next);  
    })
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
  if (projData.sharedUserGroups && (!_.isArray(projData.sharedUserGroups) ||
      !_.every(projData.sharedUserGroups, validationUtil.isValidObjectId))) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'sharedUserGroups',
      errMsg: 'must be an array with valid ids'
    });
  }
  if (projData.sharedUsers && (!_.isArray(projData.sharedUsers) ||
      !_.every(projData.sharedUsers, validationUtil.isValidObjectId))) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'sharedUsers',
      errMsg: 'must be an array with valid ids'
    });
  }
  return Promise.resolve(projData);
}

function _getCompiledTemplate(data) {
  function validateParams() {
    if (!validationUtil.isValidObjectId(data.projId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'projectId', errMsg: 'must be a valid id' });
    }
    if (!validationUtil.isValidObjectId(data.docId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'docId', errMsg: 'must be a valid id' });
    }
    return Promise.resolve(data);
  }

  function loadTermTemplates(data) {
    return termTsSrvc
      .getTermTemplates({}, '')
      .then(termTempls => {
        data.termTempls = termTempls;
        return data;
      });
  }

  function loadProjectValues(data) {
    return projectsSrvc
      .getProject({ _id: data.projId }, 'values')
      .then(proj => {
        data.values = _.reduce(proj.values, (result, variable) => {
          var termTempl = _.find(data.termTempls, { variable: variable.variable });
          if (!termTempl) {
            result[variable.variable] = variable.value;
            return result;
          }
          switch (termTempl.termType) {
            case 'boolean':
              result[variable.variable] = variable.value === 'true';
              break;
            case 'number':
              if (variable.value === null)
                result[variable.variable] = termTempl.number.placeholder;
              else
                result[variable.variable] = variable.value;
              break;
            case 'date':
              result[variable.variable] = variable.value ? moment(variable.value).format('MMMM D, YYYY') : '';
              break;
            default:
              result[variable.variable] = variable.value;
              break;
          }
          return result;
        }, {});
        data.expandables = _.filter(data.termTempls,{termType: 'expandable_text'});
        return data;
      });
  }

  function loadTemplate(data) {
    return provisionTsSrvc
      .getDocumentProvisionTemplates(data.docId, 'template')
      .then(provTempls => {
        var template = _.map(provTempls, provTempl => provTempl.template).join('\n');
        var variables = Object.keys(data.values);

        _.each(data.expandables, expandable => {
          var newline = (expandable.expandable_text !== undefined && expandable.expandable_text.newline) ? true : false;
          var prettify = (expandable.expandable_text !== undefined && expandable.expandable_text.prettify) ? true : false;
          var subs = _.filter(variables, v => v.indexOf(expandable.variable + '__') === 0);
          subs = _.map(subs, sub => data.values[sub]);
          subs = _.reverse(subs);
          if(subs.length > 0) {
            var glue = ' ';
            if(newline && prettify)
              glue = ',<br/>';
            else if(newline)
              glue = '<br/>';
            else if(prettify)
              glue = ', ';
            if(prettify) {
              var temp = subs.slice(0,-1).join(glue);
              var last = subs[subs.length-1];
              if(newline)
                subs = temp + '<br/>and ' + last;
              else
                subs = temp + ' and ' + last;
            }
            else
              subs = subs.join(glue);

            template = _.replace(template, new RegExp(`{{${expandable.variable}}}`,'g'), `{{${expandable.variable}}}${glue}${subs}`);            
          }
        });
        data.template = template;
        return data;
    });
  }

  function compile(data) {
    return templProc
      .compile(data.template)
      .then(compiled => compiled(data.values));
  }

  return validateParams(data)
    .then(loadTermTemplates)
    .then(loadProjectValues)
    .then(loadTemplate)
    .then(compile);
}
