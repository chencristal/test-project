'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var termTs = require('../controllers/term-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/term-templates/:_id`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageTermTemplate', 'read'),
    termTs.getTermTemplateById
  );
  app.get(
    `/api/${apiVer}/term-templates`,
     // auth.requireRolesWrapper(['admin', 'user']),
     auth.checkPermission('ManageTermTemplate', 'read'),
     termTs.getTermTemplates
  );
  app.post(
    `/api/${apiVer}/term-templates`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'create'),
    termTs.createTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id/disable`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'update'),
    termTs.disableTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id/enable`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'update'),
    termTs.enableTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'update'),
    termTs.updateTermTemplate
  );
  app.post(
    `/api/${apiVer}/term-templates/import`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'create'),
    termTs.importFromCSV
  );
  app.get(
    `/api/${apiVer}/term-templates/:_id/export`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageTermTemplate', 'read'),
    termTs.generateCSV
  );
  app.delete(
    `/api/${apiVer}/term-templates/:_id`,
    auth.checkPermission('ManageTermTemplate', 'delete'),
    termTs.deleteTermTemplate
  );
};
