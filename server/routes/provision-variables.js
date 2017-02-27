'use strict';

var config      = require('../../config/environment');
var auth        = require('../middleware/auth');
var provisionVar = require('../controllers/provision-variables');

var apiVer = config.get('api:version');

module.exports = app => {
  /*app.get(
    `/api/${apiVer}/provision-variables/:_id`,
    auth.requireRolesWrapper(['admin', 'user']),
    provisionVar.getProvisionVariableById
  );*/
  app.get(
    `/api/${apiVer}/provision-variables`,
    auth.requireRolesWrapper(['admin', 'user']),
    provisionVar.getProvisionVariables
  );
};
