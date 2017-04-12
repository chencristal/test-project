'use strict';

var mongoose     = require('mongoose');
var consts       = require('../../consts');
var timestamps   = require('./../plugins/timestamps');
var contributors = require('./../plugins/contributors');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  firstName: String,
  role: {
    type: String,
    required: true,
    enum: consts.USER.ROLES,
    default: 'user'
  },

  userGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userGroup'
  }],

  provider: {
    type: String,
    default: 'local'
  },
  hashedPassword: String,
  salt: String,

  status: {
    type: String,
    enum: consts.USER.STATUSES  
  },
  urlLogin: {
    type: Boolean,
    default: false
  },
  invited: {
    type: Boolean,
    default: false
  },

  forgotKey: String,
  forgotKeyExpiryDate: Date,
  
  lastLogin: Date,
  lastSeen: Date
});

userSchema.plugin(timestamps, { index: true });
userSchema.plugin(contributors, { index: true });

require('./user-middleware')(userSchema);

module.exports = mongoose.model('user', userSchema);
