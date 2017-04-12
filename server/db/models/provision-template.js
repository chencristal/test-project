'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

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
    templateHtml: {
      type: String,
      required: true
    },
    termTemplates: [{
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: 'termTemplate'
    }],
    orderedVariables: [String],
    status: {
      type: String,
      enum: consts.USER.STATUSES
    },
});

provisionTemplateSchema.plugin(timestamps, { index: true });
provisionTemplateSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('provisionTemplate', provisionTemplateSchema);
