'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var termTs = require('../controllers/term-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/term-templates/:_id`,
    auth.requireRolesWrapper(['admin', 'user']),
    termTs.getTermTemplateById
  );
  app.get(
    `/api/${apiVer}/term-templates`,
     auth.requireRolesWrapper(['admin', 'user']),
     termTs.getTermTemplates
  );
  app.post(
    `/api/${apiVer}/term-templates`,
    auth.requireRolesWrapper('admin'),
    termTs.createTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id/disable`,
    auth.requireRolesWrapper('admin'),
    termTs.disableTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id/enable`,
    auth.requireRolesWrapper('admin'),
    termTs.enableTermTemplate
  );
  app.put(
    `/api/${apiVer}/term-templates/:_id`,
    auth.requireRolesWrapper('admin'),
    termTs.updateTermTemplate
  );
  app.post(
    `/api/${apiVer}/term-templates/import`,
    auth.requireRolesWrapper('admin'),
    termTs.importFromCSV
  );
  app.get(
    `/api/${apiVer}/term-templates/:_id/export`,
    auth.requireRolesWrapper('admin'),
    termTs.generateCSV
  );
};
