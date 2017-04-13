'use strict';

var customErrors = require('n-custom-errors');
var UserGroup    = require('mongoose').model('userGroup');

exports.getUserGroups = (filter, keys) => {
  return UserGroup
    .find(filter, keys)
    .sort('groupName')
    .exec();
};

exports.getUserGroup = (filter, keys) => {
  return UserGroup
    .findOne(filter)
    .select(keys)
    .exec()
    .then(usergroup => {
      if (!usergroup) {
        return customErrors.rejectWithObjectNotFoundError('usergroup is not found');
      }
      return usergroup;
    });
};

exports.createUserGroup = userGroupData => {
  var filter = {
    groupName: userGroupData.groupName
  };

  return UserGroup
    .count(filter)
    .then(cnt => {
      if (cnt > 0) {
        return customErrors.rejectWithDuplicateObjectError('This group is already in use');
      }
      return UserGroup.create(userGroupData);
    });
};

exports.saveUserGroup = usergroup => {
  return usergroup
    .save();
};
