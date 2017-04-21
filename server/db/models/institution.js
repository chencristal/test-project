'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var institutionSchema = new mongoose.Schema({
  institutionName: String,

  provider: {
    type: String,
    default: 'local'
  },

  status: {
    type: String,
    enum: consts.USER.STATUSES
  }
});

institutionSchema.plugin(timestamps, { index: true });
institutionSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('institution', institutionSchema);
