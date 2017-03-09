'use strict';

var mongoose     = require('mongoose');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  projectTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'projectTemplate'
  },
  values: [{
    _id: false,
    variable: {
      type: String
    },
    value: {
      type: String
    },
    state: {
      type: Number
    }
  }]
});

projectSchema.plugin(timestamps, { index: true });
projectSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('project', projectSchema);
