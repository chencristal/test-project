'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var documentTemplateTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  institutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'institution'
  }],
  description: String,
  styles: String,
  status: {
    type: String,
    enum: consts.USER.STATUSES
  },
});

documentTemplateTypeSchema.plugin(timestamps, { index: true });
documentTemplateTypeSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('documentTemplateType', documentTemplateTypeSchema);
