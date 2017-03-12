'use strict';

var mongoose     = require('mongoose');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var projectTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  documentTemplates: [{
    type: mongoose.Schema.ObjectId,
    ref: 'documentTemplate'
  }],
  users: [{
    type: mongoose.Schema.ObjectId,
    ref: 'user'
  }],
  userGroups: [{
    type: mongoose.Schema.ObjectId,
    ref: 'userGroup'
  }]
});

projectTemplateSchema.plugin(timestamps, { index: true });
projectTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('projectTemplate', projectTemplateSchema);
