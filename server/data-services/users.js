'use strict';

var customErrors = require('n-custom-errors');
var User         = require('mongoose').model('user');
var acl          = require('../auth/acl');

exports.getUsers = (filter, keys) => {
  return User
    .find(filter, keys)
    .sort('email')
    .exec();
};

exports.getUser = (filter, keys) => {
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

exports.createUser = userData => {
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
    })
    .then(user => {
      acl.addUserRoles(userData.firstName, userData.role);
      return user;
    });
};

exports.saveUser = user => {
  return user
    .save()
    .then(user => {
      acl.addUserRoles(user.firstName, user.role);
      return user;
    });;
};
