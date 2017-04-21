'use strict';

var Promise         = require('bluebird');
var customErrors    = require('n-custom-errors');
var provisionTsSrvc = require('../data-services/provision-templates');
var validationUtil  = require('../util/validations');
var templProc       = require('../util/template-processor');

exports.getProvisionVariableById = (req, res, next) => {
  var provisionTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(provisionTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => provisionTsSrvc.getProvisionTemplate({ _id: provisionTemplId }, '-__v'))
    .then(provisionTempl => templProc.parse(provisionTempl.template))
    .then(provisionToken => res.send(provisionToken))
    .catch(next);
};