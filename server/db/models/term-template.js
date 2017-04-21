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
  institutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'institution'
  }],
  variable: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  text: {
    placeholder: String
  },
  textplus: {
    placeholder: String,
    newline: Boolean,
    prettify: Boolean
  },
  textarea: {
    rows: Number,
    style: String
  },
  date: {
    placeholder: String
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
  number: {
    placeholder: String
  },
  displayName: {
    type: String,
    required: true
  },
  help: String,
  disabled: {
    type: Boolean,
    default: false
  },
  state: {
    type: Number,
    default: 0
  }
});

termTemplateSchema.plugin(timestamps, { index: true });
termTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('termTemplate', termTemplateSchema);
