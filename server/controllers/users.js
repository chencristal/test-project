'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var usersSrvc      = require('../data-services/users');
var validationUtil = require('../util/validations');
// var acl            = require('../auth/acl');
var roleUtil       = require('../util/roles');

exports.getUsers = function(req, res, next) {
  var role = req.user.role;

  usersSrvc
    .getUsers({$or: roleUtil.getLowerRolesFilters(role)}, 
      'email firstName lastName role status')
    .then(users => res.send(users))
    .catch(next);
};

exports.getUserById = function(req, res, next) {
  var userId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(userId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id'});
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => usersSrvc.getUser({ _id: userId }, 'email firstName lastName role status'))
    .then(user => _checkPermission(req.user.role, user))
    .then(user => res.send(user))
    .catch(next);
};

exports.createUser = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['email', 'firstName', 'lastName', 'role'];
    var userData = _.pick(body, allowedFields);
    return Promise.resolve(userData);
  }

  function validateParams(userData) {
    return _validateUserData(userData);
  }

  function doEdits(userData) {
    var user = _.assign({}, userData);
    user.status = 'active';
    return user;
  }

  parseParams(req.body)    
    .then(validateParams)
    .then(doEdits)
    .then(user => _checkPermission(req.user.role, user))      // check permissions before create new user
    .then(user => usersSrvc.createUser(user))
    .then(user => res.send(user))
    .catch(next);
};

exports.updateUser = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['email', 'firstName', 'lastName', 'role', 'status'];
    var userData = _.pick(body, allowedFields);
    userData._id = req.params._id;
    return Promise.resolve(userData);
  }

  function validateParams(userData) {
    if (!validationUtil.isValidObjectId(userData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    var allowedStatuses = consts.USER.STATUSES;
    if (!_.includes(allowedStatuses, userData.status)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'status', errMsg: 'must be a valid value'});
    }
    return _validateUserData(userData);
  }

  function doEdits(data) {
    _.extend(data.user, data.userData);
    return data.user;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(userData => usersSrvc
      .getUser({ _id: userData._id })
      .then(user => {
        return { user, userData };
      })
    )    
    .then(doEdits)
    .then(user => _checkPermission(req.user.role, user))
    .then(user => usersSrvc.saveUser(user))
    .then(user => res.send(user))
    .catch(next);
};

function _checkPermission(reqRole, userData) {
  var requestorRole = roleUtil.getRoleInfo(reqRole);
  var newRole = roleUtil.getRoleInfo(userData.role);
  if (requestorRole.flag <= newRole.flag) {
    return customErrors.rejectWithAccessDeniedError();
  }
  return Promise.resolve(userData);
}

function _validateUserData(userData) {
  if (!validationUtil.isValidEmail(userData.email)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'email',
      errMsg: 'is required and must be a valid email'
    });
  }
  return Promise.resolve(userData);
}
