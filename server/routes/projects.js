'use strict';

var config   = require('../../config/environment');
var auth     = require('../middleware/auth');
var projects = require('../controllers/projects');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(
    `/api/${apiVer}/projects/:projectId/:docId/pdf`,
    auth.requireRolesWrapper('user'),
    projects.getPdf
  );
  app.get(
    `/api/${apiVer}/projects/:_id`,
    auth.requireRolesWrapper('user'),
    projects.getProjectById
  );
  app.get(
    `/api/${apiVer}/projects`,
    auth.requireRolesWrapper('user'),
    projects.getProjects
  );
  app.post(
    `/api/${apiVer}/projects`,
    auth.requireRolesWrapper('user'),
    projects.createProject
  );
  app.put(
    `/api/${apiVer}/projects/:_id`,
    auth.requireRolesWrapper('user'),
    projects.updateProject
  );
};
