'use strict';

var customErrors         = require('n-custom-errors');
var DocumentTemplateType = require('mongoose').model('documentTemplateType');

exports.getDocumentTemplateTypes = (filter, fields) => {
  return DocumentTemplateType
    .find(filter, fields)
    .exec();
};

exports.getDocumentTemplateType = (filter, fields) => {
  return DocumentTemplateType
    .findOne(filter)
    .select(fields)
    .exec()
    .then(docTemplType => {
      if (!docTemplType) {
        return customErrors.rejectWithObjectNotFoundError('documentTemplateType is not found');
      }
      return docTemplType;
    });
};

exports.isNameUnique = (name, docId) => {
  return DocumentTemplateType
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

exports.createDocumentTemplateType = docTemplTypeData => {
  return exports
    .isNameUnique(docTemplTypeData.name)
    .then(()=> DocumentTemplateType.create(docTemplTypeData));
};

exports.saveDocumentTemplateType = docTemplType => {
  return exports
    .isNameUnique(docTemplType.name, docTemplType._id)
    .then(()=> docTemplType.save());
};
