'use strict';

var config  = require('../../config/environment');
var auth    = require('../middleware/auth');
var profile = require('../controllers/profile');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(`/api/${apiVer}/profile`, auth.checkPermission('ManageProfile', 'read'), profile.getProfile);
  app.put(`/api/${apiVer}/profile`, auth.checkPermission('ManageProfile', 'update'), profile.updateProfile);
};
