'use strict';

var config = require('../../config/environment');
var auth   = require('../middleware/auth');
var termTs = require('../controllers/term-templates');

var apiVer = config.get('api:version');

module.exports = function(app) {
  app.get(`/api/${apiVer}/term-templates/:_id`, auth.requireRolesWrapper('admin'), termTs.getTermTemplateById);
  app.get(`/api/${apiVer}/term-templates`, auth.requireRolesWrapper('admin'), termTs.getTermTemplates);
  app.post(`/api/${apiVer}/term-templates`, auth.requireRolesWrapper('admin'), termTs.createTermTemplate);
  app.put(`/api/${apiVer}/term-templates/:_id`, auth.requireRolesWrapper('admin'), termTs.updateTermTemplate);
  app.delete(`/api/${apiVer}/term-templates/:_id`, auth.requireRolesWrapper('admin'), termTs.deleteTermTemplate);
};
