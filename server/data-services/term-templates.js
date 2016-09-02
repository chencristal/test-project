'use strict';

var customErrors = require('n-custom-errors');
var TermTemplate = require('mongoose').model('termTemplate');

exports.getTermTemplate = function(filter, keys) {
  return TermTemplate
    .findOne(filter)
    .select(keys)
    .exec()
    .then(termTempl => {
      if (!termTempl) {
        return customErrors.rejectWithObjectNotFoundError('termTemplate is not found');
      }
      return termTempl;
    });
};

exports.getTermTemplates = function(filter, keys) {
  return TermTemplate.find(filter, keys);
};

exports.createTermTemplate = function(termTemplData) {
  return TermTemplate.create(termTemplData);
};

exports.saveTermTemplate = function(termTempl) {
  return termTempl.save();
};

exports.deleteTermTemplateById = function(termTemplId) {
  return exports
    .getTermTemplate({ _id: termTemplId })
    .then(termTempl => {
      termTempl.deleted = new Date();
      return termTempl.save();
    });
};
