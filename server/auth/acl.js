'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var module_acl     = require('acl');
var log            = require('../util/logger').logger;
var consts         = require('../consts');

var acl = null;

exports.initialize = function(connection) {

  if (acl !== null) {
    return false;
  }

  acl = new module_acl(new module_acl.mongodbBackend(connection.db, 'acl_'));

  //
  // Now assign permissions to roles
  //
  acl.allow('superadmin', 
    [
      'ManageAdmin',
      'ManageAdminGroup', 
      'ManageAuthor', 
      'ManageAuthorGroup',
      'ManageUser', 
      'ManageUserGroup'
    ],
    [ 'read', 'create', 'update', 'delete' ]
  );

  acl.allow('admin', 
    [
      'ManageAuthor', 
      'ManageAuthorGroup',
      'ManageUser', 
      'ManageUserGroup'
    ],
    [ 'read', 'create', 'update', 'delete' ]
  );

  acl.allow('author', 
    [
      'ManageUser', 
      'ManageUserGroup'
    ],
    [ 'read', 'create', 'update', 'delete' ]
  );

  acl.allow('user', 
    [
      'ManageUser', 
      'ManageUserGroup'
    ],
    [ 'read' ]
  );

  /*acl.roleUsers('superadmin', function(err, users) {
    if (err) console.log(err);
    else console.log(users);
  });*/

  //
  // Now assign `superadmin` permission to `admin` (username)
  //
  _addUserRoles('admin', 'superadmin')
    .then(roles => true)
    .catch(err => customErrors.rejectWithUnprocessableRequestError(err.message));
};

exports.userRoles = function(userId) {
  return _userRoles(userId);
}

exports.addUserRoles = function(userId, roles) {
  return _addUserRoles(userId, roles);
}

exports.isAllowed = function(userId, resource, action) {
  return _isAllowed(userId, resource, action);
}

function _isAllowed(userId, resource, action) {
  return new Promise((resolve, reject) => {
    acl.isAllowed(userId, resource, action, function(err, allowed) {
      if (err) {
        reject(err);
      }
      else {
        resolve(allowed);
      }
    });
  });
}

function _addUserRoles(userId, roles) {
  var usersSrvc = require('../data-services/users');
  
  return new Promise((resolve, reject) => {
    acl.addUserRoles(userId, roles, function(err) {
      if (err) {
        reject(err);
      }
      else {
        usersSrvc
          .getUser({ firstName: userId })
          .then(user => {
            if (_.isString(roles))
              roles = [roles];
              
            user.role = roles[0];
            return usersSrvc.saveUser(user);
          })
          .then(user => resolve(roles));
      }
    });
  });
}

function _userRoles(userId) {
  return new Promise((resolve, reject) => {
    acl.userRoles(userId, function(err, roles) {
      if (err) {
        reject(err);
      } 
      else {
        if (_.isEmpty(roles)) {
          _addUserRoles(userId, 'user')
            .then(roles => resolve(roles))
            .catch(err => customErrors.rejectWithUnprocessableRequestError(err.message));
        }
        else {
          resolve(roles);
        }
      }
    });
  });
}


exports.acl = acl;