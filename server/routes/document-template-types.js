'use strict';

var config        = require('../../config/environment');
var auth          = require('../middleware/auth');
var docTemplTypes = require('../controllers/document-template-types');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/document-template-types/:_id`,
    auth.requireRolesWrapper(['admin', 'user']),
    docTemplTypes.getDocumentTemplateTypeById
  );
  app.get(
    `/api/${apiVer}/document-template-types`,
    auth.requireRolesWrapper(['admin', 'user']),
    docTemplTypes.getDocumentTemplateTypes
  );
  app.post(
    `/api/${apiVer}/document-template-types`,
    auth.requireRolesWrapper('admin'),
    docTemplTypes.createDocumentTemplateType
  );
  app.put(
    `/api/${apiVer}/document-template-types/:_id`,
    auth.requireRolesWrapper('admin'),
    docTemplTypes.updateDocumentTemplateType
  );
};
