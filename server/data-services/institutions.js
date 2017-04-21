'use strict';

var customErrors = require('n-custom-errors');
var Institution  = require('mongoose').model('institution');

exports.getInstitutions = (filter, keys) => {
  return Institution
    .find(filter, keys)
    .sort('institutionName')
    .exec();
};

exports.getInstitution = (filter, keys) => {
  return Institution
    .findOne(filter)
    .select(keys)
    .exec()
    .then(institution => {
      if (!institution) {
        return customErrors.rejectWithObjectNotFoundError('institution is not found');
      }
      return institution;
    });
};

exports.createInstitution = institutionData => {
  var filter = {
    institutionName: institutionData.institutionName
  };

  return Institution
    .count(filter)
    .then(cnt => {
      if (cnt > 0) {
        return customErrors.rejectWithDuplicateObjectError('This institution is already in use');
      }
      return Institution.create(institutionData);
    });
};

exports.saveInstitution = institution => {
  return institution.save();
};
