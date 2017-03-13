'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var users  = require('../controllers/users');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(`/api/${apiVer}/users/:_id`, auth.checkPermission('ManageUser', 'read'), users.getUserById);
  app.get(`/api/${apiVer}/users`, auth.checkPermission('ManageUser', 'read'), users.getUsers);
  app.post(`/api/${apiVer}/users`, auth.checkPermission('ManageUser', 'create'), users.createUser);
  app.put(`/api/${apiVer}/users/:_id`, auth.checkPermission('ManageUser', ['update', 'delete']), users.updateUser);
};
