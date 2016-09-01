'use strict';

var config = require('../../config/environment');
var termTs = require('../controllers/term-templates');

var apiVer = config.get('api:version');

module.exports = function(app) {
  app.get(`/api/${apiVer}/term-templates/:_id`, termTs.getTermTemplateById);
  app.get(`/api/${apiVer}/term-templates`, termTs.getTermTemplates);
  app.post(`/api/${apiVer}/term-templates`, termTs.createTermTemplate);
  app.put(`/api/${apiVer}/term-templates/:_id`, termTs.updateTermTemplate);
  app.delete(`/api/${apiVer}/term-templates/:_id`, termTs.deleteTermTemplate);
};
