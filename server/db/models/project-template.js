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
  }]
});

projectTemplateSchema.plugin(timestamps, { index: true });
projectTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('projectTemplate', projectTemplateSchema);
