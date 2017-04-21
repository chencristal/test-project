'use strict';

var _                = require('lodash');
var Promise          = require('bluebird');
var customErrors     = require('n-custom-errors');
var consts           = require('../consts');
var institutionsSrvc = require('../data-services/institutions');
var usersSrvc        = require('../data-services/users');
var validationUtil   = require('../util/validations');
var roleUtil         = require('../util/roles');

exports.getInstitutions = function(req, res, next) {
  var role = req.user.role;

  function parseParams(query) {
    var data = {
      params: _.pick(query, ['query', 'includes'])
    };
    data.fields = req.query.fields || [ 'institutionName', 'status' ];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = [ 'institutionName', 'status' ];

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
      data.filter.institutionName = {
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

  function resetOrder(institutions) {
    var orderedInstitutions = [];
    if(!req.query.includes) {
      res.send(institutions);
      return;
    }
    _.each(req.query.includes, function(id) {
      var institution = _.find(institutions, d => { return d._id.equals(id); });
      orderedInstitutions.push(institution);
    });
    res.send(orderedInstitutions);
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => institutionsSrvc.getInstitutions(data.filter, data.fields.join(' ')))
    .then(resetOrder)
    .catch(next);
};

exports.getInstitutionById = function(req, res, next) {
  var institutionId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(institutionId)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'id', 
          errMsg: 'must be a valid id'
        });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => institutionsSrvc.getInstitution({ _id: institutionId }, 'institutionName status'))
    .then(_concatMembers)
    // .then(institution => _checkPermission(req.user.role, institution))
    .then(institution => res.send(institution))
    .catch(next);
};

exports.createInstitution = function(req, res, next) {
  var assignedUsers = null;
  
  function parseParams(body) {
    var allowedFields = ['institutionName'];
    var institutionData = _.pick(body, allowedFields);

    if (body.assigned) {
      assignedUsers = body.assigned;      // for the assigned users
    }

    return Promise.resolve(institutionData);
  }

  function validateParams(institutionData) {
    return Promise.resolve(institutionData);
  }

  function doEdits(institutionData) {
    var institution = _.assign({}, institutionData);
    institution.status = 'active';
    return institution;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    // .then(institution => _checkPermission(req.user.role, institution))
    .then(institution => institutionsSrvc.createInstitution(institution))
    .then(institution => _assignMembers(institution, assignedUsers))
    .then(institution => res.send(institution))
    .catch(next);
};

exports.updateInstitution = function(req, res, next) {
  var assignedUsers = null;

  function parseParams(body) {
    var allowedFields = ['institutionName', 'status'];
    var institutionData = _.pick(body, allowedFields);
    institutionData._id = req.params._id;

    if (body.assigned) {
      assignedUsers = body.assigned;      // for the assigned users
    }

    return Promise.resolve(institutionData);
  }

  function validateParams(institutionData) {
    if (!validationUtil.isValidObjectId(institutionData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'id', 
          errMsg: 'must be a valid id' 
        });
    }
    var allowedStatuses = consts.USER.STATUSES;
    if (!_.includes(allowedStatuses, institutionData.status)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'status', 
          errMsg: 'must be a valid value'
        });
    }
    return Promise.resolve(institutionData);
  }

  function doEdits(data) {
    _.extend(data.institution, data.institutionData);
    return data.institution;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(institutionData => institutionsSrvc
      .getInstitution({ _id: institutionData._id })
      .then(institution => _getAssigned(institution)
        .then(users => _removeMembers(institution, users))
        .then(institution => {
          return { institution, institutionData };
        })
      )
    )    
    .then(doEdits)
    /*.then(institution => _getAssigned(institution)
      .then(users => _removeMembers(institution, users))
    )*/
    // .then(institution => _checkPermission(req.user.role, institution))
    .then(institution => institutionsSrvc.saveInstitution(institution))
    .then(institution => _assignMembers(institution, assignedUsers))
    .then(institution => res.send(institution))
    .catch(next);
};

function _checkPermission(reqRole, institutionData) {
  var requestorRole = roleUtil.getRoleInfo(reqRole);
  var newRole = roleUtil.getRoleInfo(institutionData.role);
  if (requestorRole.flag <= newRole.flag) {
    return customErrors.rejectWithAccessDeniedError();
  }
  return Promise.resolve(institutionData);
}

var _getAssigned = (institutionData) => {
  return usersSrvc
    .getUsers({ 'institutions': institutionData._id })
    .then(users => {
      return Promise.resolve(users);
    });
};

var _concatMembers = (institutionData) => {
  institutionData = _.assign(institutionData.toObject(), { assigned: [] });

  return usersSrvc
    .getUsers({ 'institutions': institutionData._id })
    .then(users => {
      institutionData.assigned = _.concat(institutionData.assigned, users);
      return Promise.resolve(institutionData);
    });
};

var _assignMembers = (institutionData, assignedUsers) => {
  if (assignedUsers && !_.isEmpty(assignedUsers)) {
    return usersSrvc
      .updateUsers({
        '_id': { $in: assignedUsers }
      }, {
        $push: { 'institutions': institutionData._id }
      })
      .then(() => Promise.resolve(institutionData));
  }
  else {
    return Promise.resolve(institutionData);
  }
};

var _removeMembers = (institutionData, assignedUsers) => {
  if (assignedUsers && !_.isEmpty(assignedUsers)) {
    return usersSrvc
      .updateUsers({
        '_id': { $in: assignedUsers }
      }, {
        $pull: { 'institutions': institutionData._id }
      })
      .then(() => Promise.resolve(institutionData));
  }
  else {
    return Promise.resolve(institutionData);
  }
};