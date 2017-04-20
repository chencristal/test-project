'use strict';

var config       = require('../../config/environment');
var auth         = require('../middleware/auth');
var institutions = require('../controllers/institutions');

var apiVer = config.get('api:version');

module.exports = app => {
  app.get(`/api/${apiVer}/institutions/:_id`, 
      auth.checkPermission('ManageInstitution', 'read'), 
      institutions.getInstitutionById);
  app.get(`/api/${apiVer}/institutions`, 
      auth.checkPermission('ManageInstitution', 'read'), 
      institutions.getInstitutions);
  app.post(`/api/${apiVer}/institutions`, 
      auth.checkPermission('ManageInstitution', 'create'), 
      institutions.createInstitution);
  app.put(`/api/${apiVer}/institutions/:_id`, 
      auth.checkPermission('ManageInstitution', ['update', 'delete']), 
      institutions.updateInstitution);
};
