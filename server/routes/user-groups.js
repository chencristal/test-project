'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var userGroups  = require('../controllers/user-groups');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(`/api/${apiVer}/user-groups/:_id`, auth.checkPermission('ManageUserGroup', 'read'), userGroups.getUserGroupById);
  app.get(`/api/${apiVer}/user-groups`, auth.checkPermission('ManageUserGroup', 'read'), userGroups.getUserGroups);
  app.post(`/api/${apiVer}/user-groups`, auth.checkPermission('ManageUserGroup', 'create'), userGroups.createUserGroup);
  app.put(`/api/${apiVer}/user-groups/:_id`, auth.checkPermission('ManageUserGroup', ['update', 'delete']), userGroups.updateUserGroup);
};
