'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var termTemplateSubDoc = new mongoose.Schema();
termTemplateSubDoc.add({
  termTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'termTemplate'
  },
  termTemplates: [termTemplateSubDoc]
});

var provisionTemplateSchema = new mongoose.Schema({
    displayName: {
      type: String,
      required: true
    },
    style: {
        type: String,
        enum: consts.PROVISION_STYLES
    },
    template: {
      type: String,
      required: true
    },
    // TODO: unues? condition: BOOLEAN_TERM_TEMPLATE,
    termTemplates: [termTemplateSubDoc]
});

provisionTemplateSchema.plugin(timestamps, { index: true });
provisionTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('provisionTemplate', provisionTemplateSchema);
