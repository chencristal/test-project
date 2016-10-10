'use strict';

var config    = require('../../config/environment');
var auth      = require('../middleware/auth');
var docTempls = require('../controllers/document-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/document-templates/:_id`,
    auth.requireRolesWrapper(['admin', 'user']),
    docTempls.getDocumentTemplateById
  );
  app.get(
    `/api/${apiVer}/document-templates`,
    auth.requireRolesWrapper(['admin', 'user']),
    docTempls.getDocumentTemplates
  );
  app.post(
    `/api/${apiVer}/document-templates`,
    auth.requireRolesWrapper('admin'),
    docTempls.createDocumentTemplate
  );
  app.put(
    `/api/${apiVer}/document-templates/:_id`,
    auth.requireRolesWrapper('admin'),
    docTempls.updateDocumentTemplate
  );
};
