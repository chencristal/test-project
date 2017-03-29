'use strict';

var customErrors     = require('n-custom-errors');
var ProjectTemplate = require('mongoose').model('projectTemplate');

exports.getProjectTemplates = (filter, fields) => {
  return ProjectTemplate
    .find(filter, fields)
    .exec();
};

// Not used yet
exports.getUserProjectTemplates = (user) => {
  return ProjectTemplate
    .find({
      $or: [
        { users: user._id }, 
        { userGroups: { $in: user.userGroups } }, 
        { allUsers: true }
      ]
    })
    .exec();
};

exports.getProjectTemplate = (filter, fields) => {
  return ProjectTemplate
    .findOne(filter)
    .select(fields)
    .exec()
    .then(projTempl => {
      if (!projTempl) {
        return customErrors.rejectWithObjectNotFoundError('projectTemplate is not found');
      }
      return projTempl;
    });
};

exports.isNameUnique = (name, docId) => {
  return ProjectTemplate
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

exports.createProjectTemplate = projTemplData => {
  return exports
    .isNameUnique(projTemplData.name)
    .then(()=> ProjectTemplate.create(projTemplData));
};

exports.saveProjectTemplate = projTempl => {
  return exports
    .isNameUnique(projTempl.name, projTempl._id)
    .then(()=> projTempl.save());
};

exports.deleteProjectTemplate = projTempl => {
  return projTempl.remove();
};