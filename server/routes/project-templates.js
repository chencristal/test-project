'use strict';

var config     = require('../../config/environment');
var auth       = require('../middleware/auth');
var projTempls = require('../controllers/project-templates');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/project-templates/:_id`,
    auth.requireRolesWrapper('admin'),
    projTempls.getProjectTemplateById
  );
  app.get(
    `/api/${apiVer}/project-templates`,
    auth.requireRolesWrapper('admin'),
    projTempls.getProjectTemplates
  );
  app.post(
    `/api/${apiVer}/project-templates`,
    auth.requireRolesWrapper('admin'),
    projTempls.createProjectTemplate
  );
  app.put(
    `/api/${apiVer}/project-templates/:_id`,
    auth.requireRolesWrapper('admin'),
    projTempls.updateProjectTemplate
  );
};
