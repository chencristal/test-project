'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var termTemplateSchema = new mongoose.Schema({
  termType: {
    type: String,
    enum: consts.TERM_TYPES,
    required: true
  },
  variable: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  text: {
    placeholder: String
  },
  date: {
    default: Date
  },
  boolean: {
    inclusionText: {
      type: String,
      required: true,
      default: 'Include'
    },
    exclusionText: {
      type: String,
      required: true,
      default: 'Exclude'
    },
    default: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  variant: {
    options: [{
      _id: false,
      id: {
        type: Number,
        required: true,
      },
      value: {
        type: String,
        required: true
      }
    }],
    default: {
      type: String
    },
    displayAs: {
      type: String,
      required: true,
      default: 'dropdown'
    }
  },
  displayName: {
    type: String,
    required: true
  },
  help: String,
  disabled: {
    type: Boolean,
    default: false
  }
});

termTemplateSchema.plugin(timestamps, { index: true });
termTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('termTemplate', termTemplateSchema);
