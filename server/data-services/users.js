'use strict';

var customErrors = require('n-custom-errors');
var User         = require('mongoose').model('user');

exports.getUser = function(filter, keys) {
  return User
    .findOne(filter)
    .select(keys)
    .exec()
    .then(user => {
      if (!user) {
        return customErrors.rejectWithObjectNotFoundError('user is not found');
      }
      return user;
    });
};

exports.getUsers = function(filter, keys) {
  return User.find(filter, keys);
};

exports.createUser = function(userData) {
  var filter = {
    email: (userData.email || '').toLowerCase()
  };

  return User
    .count(filter)
    .then(cnt => {
      if (cnt > 0) {
        return customErrors.rejectWithDuplicateObjectError('This email is already in use');
      }
      return User.create(userData);
    });
};

exports.saveUser = function(user) {
  return user.save();
};
