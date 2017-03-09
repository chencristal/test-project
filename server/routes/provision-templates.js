'use strict';

var config      = require('../../config/environment');
var auth        = require('../middleware/auth');
var provisionTs = require('../controllers/provision-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/provision-templates/:_id`,
    auth.requireRolesWrapper(['admin', 'user']),
    provisionTs.getProvisionTemplateById
  );
  app.get(
    `/api/${apiVer}/provision-templates`,
    auth.requireRolesWrapper(['admin', 'user']),
    provisionTs.getProvisionTemplates
  );
  app.post(
    `/api/${apiVer}/provision-templates`,
    auth.requireRolesWrapper('admin'),
    provisionTs.createProvisionTemplate
  );
  app.put(
    `/api/${apiVer}/provision-templates/:_id`,
    auth.requireRolesWrapper('admin'),
    provisionTs.updateProvisionTemplate
  );
};
