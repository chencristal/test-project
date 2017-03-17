'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var userGroupSchema = new mongoose.Schema({
  groupName: String,
  role: {
    type: String,
    required: true,
    enum: consts.USER.ROLES,
    default: 'user'
  },

  provider: {
    type: String,
    default: 'local'
  },

  status: {
    type: String,
    enum: consts.USER.STATUSES
  }
});

userGroupSchema.plugin(timestamps, { index: true });
userGroupSchema.plugin(contributors, { index: true });

module.exports = mongoose.model('userGroup', userGroupSchema);
