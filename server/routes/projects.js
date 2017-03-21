'use strict';

var config   = require('../../config/environment');
var auth     = require('../middleware/auth');
var projects = require('../controllers/projects');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/pdf`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'read'),
    projects.generatePdf
  );
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/:docTypeId/word`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'read'),
    projects.generateWord
  );
  app.get(
    `/api/${apiVer}/projects/:_id`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'read'),
    projects.getProjectById
  );
  app.get(
    `/api/${apiVer}/projects`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'read'),
    // projects.getProjects
    projects.getUserProjects
  );
  app.post(
    `/api/${apiVer}/projects`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'create'),
    projects.createProject
  );
  app.put(
    `/api/${apiVer}/projects/:_id`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'update'),
    projects.updateProject
  );
  app.delete(
    `/api/${apiVer}/projects/:_id`,
    // auth.requireRolesWrapper('user'),
    auth.checkPermission('ManageProject', 'delete'),
    projects.deleteProject
  );
};
