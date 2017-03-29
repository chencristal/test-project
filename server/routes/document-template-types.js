'use strict';

var config        = require('../../config/environment');
var auth          = require('../middleware/auth');
var docTemplTypes = require('../controllers/document-template-types');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/document-template-types/:_id`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageDocumentTemplateType', 'read'),
    docTemplTypes.getDocumentTemplateTypeById
  );
  app.get(
    `/api/${apiVer}/document-template-types`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageDocumentTemplateType', 'read'),
    docTemplTypes.getDocumentTemplateTypes
  );
  app.post(
    `/api/${apiVer}/document-template-types`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageDocumentTemplateType', 'create'),
    docTemplTypes.createDocumentTemplateType
  );
  app.put(
    `/api/${apiVer}/document-template-types/:_id`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageDocumentTemplateType', 'update'),
    docTemplTypes.updateDocumentTemplateType
  );
  app.delete(
    `/api/${apiVer}/document-template-types/:_id`,
    auth.checkPermission('ManageDocumentTemplateType', 'delete'),
    docTemplTypes.deleteDocumentTemplateType
  );
};
