'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var termTemplateSchema = new mongoose.Schema({
  termType: {
    type: String,
    enum: consts.TERM_TEMPLATES,
    required: true
  },
  variable: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  boolean: {
    default: {
      type: Boolean,
      required: true,
      default: false
    },
    inclusionText: {
      type: String,
      required: true,
      default: 'Include'
    },
    exclusionText: {
      type: String,
      required: true,
      default: 'Exclude'
    }
  },
  date: {
    default: {
      type: Date,
      required: true,
      default: '2016-01-01' // TODO: use real date
    }
  },
  displayName: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: false
  },
  help: String,
  deleted: Date
});

termTemplateSchema.plugin(timestamps, { index: true });
termTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('termTemplate', termTemplateSchema);
