'use strict';

var customErrors = require('n-custom-errors');
var Project      = require('mongoose').model('project');

exports.getProjects = (filter, fields) => {
  return Project
    .find(filter, fields)
    .exec();
};

exports.getUserProjects = (user) => {
  return Project
    .find({owner: user._id})
    .populate('owner')
    .populate('sharedUsers')
    .populate('sharedUserGroups')
    .exec();
}

exports.getSharedProjects = (user) => {
  return Project
    .find({owner: {$ne: user._id}})
    .find({$or: [{sharedUsers: user._id}, {sharedUserGroups: { $in: user.userGroups }}]})
    .populate('owner')
    .populate('sharedUsers')
    .populate('sharedUserGroups')
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