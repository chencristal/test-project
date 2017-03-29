'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var documentTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  documentType: {
    type: mongoose.Schema.ObjectId,
    ref: 'documentTemplateType',
    required: true,
    index: true
  },
  provisionTemplates: [{
    type: mongoose.Schema.ObjectId,
    ref: 'provisionTemplate'
  }],
  status: {
    type: String,
    enum: consts.USER.STATUSES
  },
});

documentTemplateSchema.plugin(timestamps, { index: true });
documentTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('documentTemplate', documentTemplateSchema);
