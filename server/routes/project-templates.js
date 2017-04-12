'use strict';

var config     = require('../../config/environment');
var auth       = require('../middleware/auth');
var projTempls = require('../controllers/project-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/project-templates/:_id`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageProjectTemplate', 'read'),
    projTempls.getProjectTemplateById
  );
  app.get(
    `/api/${apiVer}/project-templates`,
    // auth.requireRolesWrapper(['admin', 'user']),
    auth.checkPermission('ManageProjectTemplate', 'read'),
    // projTempls.getProjectTemplates
    projTempls.getUserProjectTemplates
  );
  app.post(
    `/api/${apiVer}/project-templates`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageProjectTemplate', 'create'),
    projTempls.createProjectTemplate
  );
  app.put(
    `/api/${apiVer}/project-templates/:_id`,
    // auth.requireRolesWrapper('admin'),
    auth.checkPermission('ManageProjectTemplate', 'update'),
    projTempls.updateProjectTemplate
  );
  app.delete(
    `/api/${apiVer}/project-templates/:_id`,
    auth.checkPermission('ManageProjectTemplate', 'delete'),
    projTempls.deleteProjectTemplate
  );
};
