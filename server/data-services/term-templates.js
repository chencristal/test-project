'use strict';

var customErrors = require('n-custom-errors');
var TermTemplate = require('mongoose').model('termTemplate');

exports.getTermTemplates = (filter, fields) => {
  return TermTemplate
    .find(filter, fields)
    .sort('displayName')
    .exec();
};

exports.getActiveTermTemplates = (filter, fields) => {
  filter = filter || {};
  filter.deleted = { $exists: false };
  return exports.getTermTemplates(filter, fields);
};

exports.getTermTemplate = (filter, fields) => {
  return TermTemplate
    .findOne(filter)
    .select(fields)
    .exec()
    .then(termTempl => {
      if (!termTempl) {
        return customErrors.rejectWithObjectNotFoundError('termTemplate is not found');
      }
      return termTempl;
    });
};

exports.createTermTemplate = termTemplData => {
  return TermTemplate
    .count({ variable: termTemplData.variable })
    .then(cnt => {
      if (cnt > 0) {
        return customErrors.rejectWithDuplicateObjectError(`This variable is already in use`);
      }
      return TermTemplate.create(termTemplData);
    });
};

exports.saveTermTemplate = termTempl => {
  return termTempl.save();
};

exports.deleteTermTemplateById = termTemplId => {
  return exports
    .getTermTemplate({ _id: termTemplId })
    .then(termTempl => {
      termTempl.deleted = new Date();
      return termTempl.save();
    });
};
