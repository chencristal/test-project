'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var users  = require('../controllers/users');

var apiVer = config.get('api:version');

module.exports = function(app) {
  app.get(`/api/${apiVer}/users/:_id`, auth.requireRolesWrapper('admin'), users.getUserById);
  app.get(`/api/${apiVer}/users`, auth.requireRolesWrapper('admin'), users.getUsers);
  app.post(`/api/${apiVer}/users`, auth.requireRolesWrapper('admin'), users.createUser);
  app.put(`/api/${apiVer}/users/:_id`, auth.requireRolesWrapper('admin'), users.updateUser);
};
