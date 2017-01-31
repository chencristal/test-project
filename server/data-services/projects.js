'use strict';

var _            = require('lodash');
var mongoose     = require('mongoose');
var customErrors = require('n-custom-errors');
var Project      = mongoose.model('project');

exports.getProjects = (filter, fields) => {
  return Project
    .find(filter, fields)
    .exec();
};

exports.getProject = (filter, fields) => {
  return Project
    .findOne(filter)
    .select(fields)
    .populate('projectTemplate', 'documentTemplates')
    .exec()
    .then(proj => {
      if (!proj) {
        return customErrors.rejectWithObjectNotFoundError('project is not found');
      }
      _.each(proj.values, function(variable, index) {
          if(variable.value == parseFloat(variable.value)) {
            var newvalue = parseFloat(variable.value);
            proj.values[index] = {variable: variable.variable, state: variable.state, value: newvalue};
          }
      });
      return proj;
    });
};

exports.isNameUnique = (name, docId) => {
  return Project
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

exports.createProject = projData => {
  return exports
    .isNameUnique(projData.name)
    .then(()=> Project.create(projData));
};

exports.saveProject = proj => {
  return exports
    .isNameUnique(proj.name, proj._id)
    .then(()=> proj.save());
};

exports.deleteProject = proj => {
  return proj.remove();
};