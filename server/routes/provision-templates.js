'use strict';

var config      = require('../../config/environment');
var auth        = require('../middleware/auth');
var provisionTs = require('../controllers/provision-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/provision-templates/:_id`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageProvisionTemplate', 'read'),
    provisionTs.getProvisionTemplateById
  );
  app.get(
    `/api/${apiVer}/provision-templates`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageProvisionTemplate', 'read'),
    provisionTs.getProvisionTemplates
  );
  app.post(
    `/api/${apiVer}/provision-templates`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageProvisionTemplate', 'create'),
    provisionTs.createProvisionTemplate
  );
  app.put(
    `/api/${apiVer}/provision-templates/:_id`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageProvisionTemplate', 'update'),
    provisionTs.updateProvisionTemplate
  );
  app.delete(
    `/api/${apiVer}/provision-templates/:_id`,
    auth.checkPermission('ManageProvisionTemplate', 'delete'),
    provisionTs.deleteProvisionTemplate
  );
};
