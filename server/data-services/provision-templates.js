'use strict';

var customErrors      = require('n-custom-errors');
var ProvisionTemplate = require('mongoose').model('provisionTemplate');

exports.getProvisionTemplates = (filter, fields) => {
  return ProvisionTemplate
    .find(filter, fields)
    .exec();
};

exports.getProvisionTemplate = (filter, fields) => {
  return ProvisionTemplate
    .findOne(filter)
    .select(fields)
    .exec()
    .then(provisionTempl => {
      if (!provisionTempl) {
        return customErrors.rejectWithObjectNotFoundError('provisionTemplate is not found');
      }
      return provisionTempl;
    });
};

exports.createProvisionTemplate = provisionTemplData => {
  return ProvisionTemplate.create(provisionTemplData);
};

exports.saveProvisionTemplate = provisionTempl => {
  return provisionTempl.save();
};
