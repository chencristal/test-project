'use strict';

var customErrors     = require('n-custom-errors');
var DocumentTemplate = require('mongoose').model('documentTemplate');

exports.getDocumentTemplates = (filter, fields) => {
  return DocumentTemplate
    .find(filter, fields)
    .sort('name')
    .exec();
};

exports.getDocumentTemplate = (filter, fields) => {
  return DocumentTemplate
    .findOne(filter)
    .select(fields)
    .exec()
    .then(docTempl => {
      if (!docTempl) {
        return customErrors.rejectWithObjectNotFoundError('documentTemplate is not found');
      }
      return docTempl;
    });
};

exports.isNameUnique = (name, docId) => {
  return DocumentTemplate
    .count({
      _id: {
        $ne: docId
      },
      name: name
    })
    .then(cnt => {
      if (cnt > 0) {
        return customErrors.rejectWithDuplicateObjectError(`This name is already in use`);
      }
      return null;
    });
};

exports.createDocumentTemplate = docTemplData => {
  return exports
    .isNameUnique(docTemplData.name)
    .then(()=> DocumentTemplate.create(docTemplData));
};

exports.saveDocumentTemplate = docTempl => {
  return exports
    .isNameUnique(docTempl.name, docTempl._id)
    .then(()=> docTempl.save());
};
