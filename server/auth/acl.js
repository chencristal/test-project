'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var ModuleAcl      = require('acl');
var customErrors   = require('n-custom-errors');

var acl = null;

exports.initialize = function(connection) {  

  if (acl !== null) {
    return false;
  }

  acl = new ModuleAcl(new ModuleAcl.mongodbBackend(connection.db, 'acl_'));
  exports.acl = acl;
  initializeUserRoles();
};

exports.removeUser = function(user) {
  var roles = ['superadmin', 'admin', 'author', 'user'];
  return new Promise((resolve, reject) => {
    acl.removeUserRoles(user.email, roles, function(err) {
      if (err) { reject(err); }
      
      resolve(user);
    });
  });
};

exports.userRoles = function(user) {
  return new Promise((resolve, reject) => {
    acl.userRoles(user.email, function(err, roles) {
      if (err) {
        reject(err);
      } 
      else {
        if (_.isEmpty(roles)) {
          exports.addUserToAcl(user)
            .then(user => resolve([user.role]))
            .catch(err => { 
              reject(err); 
            });
        }
        else {
          resolve(roles);
        }
      }
    });
  });
};

exports.isAllowed = function(user, resource, action) {
  return new Promise((resolve, reject) => {
    acl.isAllowed(user.email, resource, action, function(err, allowed) {
      if (err) { reject(err); }
      
      if (allowed === true) { resolve(user); }
      
      resolve(false);
    });
  });
};

exports.addUserToAcl = function(user) {
  function removeAllUserRoles(user) {
    var roles = ['superadmin', 'admin', 'author', 'user'];
    return new Promise((resolve, reject) => {
      acl.removeUserRoles(user.email, roles, function(err) {
        if (err) { reject(err); }

        resolve(user);
      });
    });
  }

  function addUserRole(user) {
    return new Promise((resolve, reject) => {
      acl.addUserRoles(user.email, user.role, function(err) {
        if (err) { reject(err); }

        resolve(user);
      });
    });
  }

  return removeAllUserRoles(user)
    .then(addUserRole)
    .catch(err => {
      err = customErrors.getAccessDeniedError('Access denied');
      return err;
    });
};


function initializeUserRoles() {
  acl.allow([
    {
      roles: ['superadmin'],
      allows: [
        { 
          resources: ['ManageUser', 'ManageUserGroup'], 
          permissions: ['read', 'create', 'update', 'delete'] 
        },
        { 
          resources: [
            'ManageProjectTemplate',
            'ManageDocumentTemplate',
            'ManageDocumentTemplateType',
            'ManageProvisionTemplate',
            'ManageTermTemplate',
          ],
          permissions: [ 'read', 'create', 'update', 'delete' ]
        },
        { 
          resources: [
            'ManageProfile'
          ], 
          permissions: ['read', 'update'] 
        }
      ]
    },
    {
      roles: ['admin'],
      allows: [
        { 
          resources: ['ManageUser', 'ManageUserGroup'], 
          permissions: ['read', 'create', 'update', 'delete'] 
        },
        { 
          resources: [
            'ManageProjectTemplate',
            'ManageDocumentTemplate',
            'ManageDocumentTemplateType',
            'ManageProvisionTemplate',
            'ManageTermTemplate',
          ],
          permissions: [ 'read', 'create', 'update', 'delete' ]
        },
        { 
          resources: [
            'ManageProfile'
          ], 
          permissions: ['read', 'update'] 
        }
      ]
    },
    {
      roles: ['author'],
      allows: [
        { 
          resources: [
            'ManageUser', 
            'ManageUserGroup', 
          ], 
          permissions: ['read'] 
        },
        { 
          resources: [
            'ManageProjectTemplate',
            'ManageDocumentTemplate',
            'ManageDocumentTemplateType',
            'ManageProvisionTemplate',
            'ManageTermTemplate'
          ], 
          permissions: ['read', 'create', 'update'] 
        },
        { 
          resources: [
            'ManageProfile'
          ], 
          permissions: ['read', 'update'] 
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        { 
          resources: [
            'ManageUser',
            'ManageUserGroup', 
            'ManageProjectTemplate',
            'ManageDocumentTemplate',
            'ManageDocumentTemplateType',
            'ManageProvisionTemplate',
            'ManageTermTemplate',
          ], 
          permissions: ['read'] 
        },
        { 
          resources: [
            'ManageProfile'
          ], 
          permissions: ['read', 'update'] 
        },
        { 
          resources: [
            'ManageProject'
          ], 
          permissions: ['read', 'create', 'update', 'delete'] 
        }
      ]
    }
  ]);
}