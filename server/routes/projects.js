'use strict';

var config   = require('../../config/environment');
var auth     = require('../middleware/auth');
var projects = require('../controllers/projects');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/pdf/redline`,
    auth.checkPermission('ManageProject', 'read'),
    projects.generatePdfRedline
  );
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/pdf/edit`,
    auth.checkPermission('ManageProject', 'read'),
    projects.generatePdfClean
  );
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/:docTypeId/word/redline`,
    auth.checkPermission('ManageProject', 'read'),
    projects.generateWordRedline
  );
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/:docTypeId/word/edit`,
    auth.checkPermission('ManageProject', 'read'),
    projects.generateWordClean
  );
  app.get(
    `/api/${apiVer}/projects/:_id`,
    auth.checkPermission('ManageProject', 'read'),
    projects.getProjectById
  );
  app.get(
    `/api/${apiVer}/projects`,
    auth.checkPermission('ManageProject', 'read'),
    // projects.getProjects
    projects.getUserProjects
  );
  app.post(
    `/api/${apiVer}/projects`,
    auth.checkPermission('ManageProject', 'create'),
    projects.createProject
  );
  app.put(
    `/api/${apiVer}/projects/:_id`,
    auth.checkPermission('ManageProject', 'update'),
    projects.updateProject
  );
  app.delete(
    `/api/${apiVer}/projects/:_id`,
    auth.checkPermission('ManageProject', 'delete'),
    projects.deleteProject
  );
};
