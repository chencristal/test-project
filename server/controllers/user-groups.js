'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var userGroupsSrvc = require('../data-services/user-groups');
var validationUtil = require('../util/validations');
var roleUtil       = require('../util/roles');

exports.getUserGroups = function(req, res, next) {
  var role = req.user.role;

  userGroupsSrvc
    .getUserGroups({$or: roleUtil.getLowerRolesFilters(role)}, 'groupName role status')
    .then(usergroups => res.send(usergroups))
    .catch(next);
};

exports.getUserGroupById = function(req, res, next) {
  var groupId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(groupId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id'});
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => userGroupsSrvc.getUserGroup({ _id: groupId }, 'groupName role status'))
    .then(usergroup => _checkPermission(req.user.role, usergroup))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

exports.createUserGroup = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['groupName', 'role'];
    var userGroupData = _.pick(body, allowedFields);
    return Promise.resolve(userGroupData);
  }

  function validateParams(userGroupData) {
    return Promise.resolve(userGroupData);
  }

  function doEdits(userGroupData) {
    var usergroup = _.assign({}, userGroupData);
    usergroup.status = 'active';
    return usergroup;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(usergroup => _checkPermission(req.user.role, usergroup))      // check permissions before create new user
    .then(usergroup => userGroupsSrvc.createUserGroup(usergroup))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

exports.updateUserGroup = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['groupName', 'role', 'status'];
    var userGroupData = _.pick(body, allowedFields);
    userGroupData._id = req.params._id;
    return Promise.resolve(userGroupData);
  }

  function validateParams(userGroupData) {
    if (!validationUtil.isValidObjectId(userGroupData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    var allowedStatuses = consts.USER.STATUSES;
    if (!_.includes(allowedStatuses, userGroupData.status)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'status', errMsg: 'must be a valid value'});
    }
    return Promise.resolve(userGroupData);
  }

  function doEdits(data) {
    _.extend(data.userGroup, data.userGroupData);
    return data.userGroup;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(userGroupData => userGroupsSrvc
      .getUserGroup({ _id: userGroupData._id })
      .then(userGroup => {
        return { userGroup, userGroupData };
      })
    )    
    .then(doEdits)
    .then(usergroup => _checkPermission(req.user.role, usergroup))
    .then(usergroup => userGroupsSrvc.saveUserGroup(usergroup))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

function _checkPermission(reqRole, userGroupData) {
  var requestorRole = roleUtil.getRoleInfo(reqRole);
  var newRole = roleUtil.getRoleInfo(userGroupData.role);
  if (requestorRole.flag <= newRole.flag) {
    return customErrors.rejectWithAccessDeniedError();
  }
  return Promise.resolve(userGroupData);
}