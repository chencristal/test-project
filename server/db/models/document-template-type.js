'use strict';

var mongoose     = require('mongoose');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var documentTemplateTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  styles: String
});

documentTemplateTypeSchema.plugin(timestamps, { index: true });
documentTemplateTypeSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('documentTemplateType', documentTemplateTypeSchema);
