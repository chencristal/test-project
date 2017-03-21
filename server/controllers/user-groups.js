'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var userGroupsSrvc = require('../data-services/user-groups');
var usersSrvc      = require('../data-services/users');
var validationUtil = require('../util/validations');
var roleUtil       = require('../util/roles');

exports.getUserGroups = function(req, res, next) {
  var role = req.user.role;

  function parseParams(query) {
    var data = {
      params: _.pick(query, ['query', 'role', 'includes'])
    };
    data.fields = req.query.fields || [ 'groupName', 'role', 'status' ];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = [ 'groupName', 'role', 'status' ];

    if (data.params.includes && !_.every(data.params.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    if (!_.every(data.fields, field => _.includes(allowedFields, field))) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'fields',
        errMsg: 'must be an array with valid fields'
      });
    }
    return data;
  }

  function buildFilter(data) {
    data.filter = {};
    if (data.params.role) {
      data.filter.role = 'user';

      var availRoles = roleUtil.getLowerRolesFilters(role);
      _.find(availRoles, function(o) {
        if (o === data.params.role) {
          data.filter.role = data.params.role;
        }
      });
    }
    else {
      data.filter.role = {
        $in: roleUtil.getLowerRolesFilters(role)
      };
    }
    if (data.params.query) {
      data.filter.groupName = {
        $regex: new RegExp(data.params.query, 'i')
      };
    }
    if (data.params.includes) {
      data.filter._id = {
        $in: data.params.includes
      };
    }

    return data;
  }

  function resetOrder(usergroups) {
    var orderedUserGroups = [];
    if(!req.query.includes) {
      res.send(usergroups);
      return;
    }
    _.each(req.query.includes, function(id) {
      var usergroup = _.find(usergroups, d => {return d._id == id});
      orderedUserGroups.push(usergroup);
    });
    res.send(orderedUserGroups);
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => userGroupsSrvc.getUserGroups(data.filter, data.fields.join(' ')))
    .then(resetOrder)
    .catch(next);
};

exports.getUserGroupById = function(req, res, next) {
  var groupId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(groupId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id'});
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => userGroupsSrvc.getUserGroup({ _id: groupId }, 'groupName role status'))
    .then(_concatMembers)
    .then(usergroup => _checkPermission(req.user.role, usergroup))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

exports.createUserGroup = function(req, res, next) {
  var assignedUsers = null;
  
  function parseParams(body) {
    var allowedFields = ['groupName', 'role'];
    var userGroupData = _.pick(body, allowedFields);

    if (body.assigned) {
      assignedUsers = body.assigned;      // for the assigned users
    }

    return Promise.resolve(userGroupData);
  }

  function validateParams(userGroupData) {
    return Promise.resolve(userGroupData);
  }

  function doEdits(userGroupData) {
    var usergroup = _.assign({}, userGroupData);
    usergroup.status = 'active';
    return usergroup;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(usergroup => _checkPermission(req.user.role, usergroup))
    .then(usergroup => userGroupsSrvc.createUserGroup(usergroup))
    .then(usergroup => _assignMembers(usergroup, assignedUsers))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

exports.updateUserGroup = function(req, res, next) {
  var assignedUsers = null;

  function parseParams(body) {
    var allowedFields = ['groupName', 'role', 'status'];
    var userGroupData = _.pick(body, allowedFields);
    userGroupData._id = req.params._id;

    if (body.assigned) {
      assignedUsers = body.assigned;      // for the assigned users
    }

    return Promise.resolve(userGroupData);
  }

  function validateParams(userGroupData) {
    if (!validationUtil.isValidObjectId(userGroupData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    var allowedStatuses = consts.USER.STATUSES;
    if (!_.includes(allowedStatuses, userGroupData.status)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'status', errMsg: 'must be a valid value'});
    }
    return Promise.resolve(userGroupData);
  }

  function doEdits(data) {
    _.extend(data.userGroup, data.userGroupData);
    return data.userGroup;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(userGroupData => userGroupsSrvc
      .getUserGroup({ _id: userGroupData._id })
      .then(usergroup => _getAssigned(usergroup)
        .then(users => _removeMembers(usergroup, users))
        .then(userGroup => {
          return { userGroup, userGroupData };
        })
      )
    )    
    .then(doEdits)
    .then(usergroup => _getAssigned(usergroup)
      .then(users => _removeMembers(usergroup, users))
    )
    .then(usergroup => _checkPermission(req.user.role, usergroup))
    .then(usergroup => userGroupsSrvc.saveUserGroup(usergroup))
    .then(usergroup => _assignMembers(usergroup, assignedUsers))
    .then(usergroup => res.send(usergroup))
    .catch(next);
};

function _checkPermission(reqRole, userGroupData) {
  var requestorRole = roleUtil.getRoleInfo(reqRole);
  var newRole = roleUtil.getRoleInfo(userGroupData.role);  
  if (requestorRole.flag <= newRole.flag) {
    return customErrors.rejectWithAccessDeniedError();
  }
  return Promise.resolve(userGroupData);
}

var _getAssigned = (userGroupData) => {
  return usersSrvc
    .getUsers({
      'userGroups': userGroupData._id,
      'role': userGroupData.role
    })
    .then(users => {
      return Promise.resolve(users);
    });
};

var _concatMembers = (userGroupData) => {
  userGroupData = _.assign(userGroupData.toObject(), { assigned: [] });

  return usersSrvc
    .getUsers({
      'userGroups': userGroupData._id,
      'role': userGroupData.role
    })
    .then(users => {
      userGroupData.assigned = _.concat(userGroupData.assigned, users);
      return Promise.resolve(userGroupData);
    });
};

var _assignMembers = (userGroupData, assignedUsers) => {
  if (assignedUsers && !_.isEmpty(assignedUsers)) {
    return usersSrvc
      .updateUsers({
        '_id': { $in: assignedUsers },
        'role': userGroupData.role
      }, {
        $push: { 'userGroups': userGroupData._id }
      })
      .then(result => {
        return Promise.resolve(userGroupData);
      });
  }
  else
    return Promise.resolve(userGroupData);
};

var _removeMembers = (userGroupData, assignedUsers) => {
  if (assignedUsers && !_.isEmpty(assignedUsers)) {
    return usersSrvc
      .updateUsers({
        '_id': { $in: assignedUsers },
        'role': userGroupData.role
      }, {
        $pull: { 'userGroups': userGroupData._id }
      })
      .then(result => {
        return Promise.resolve(userGroupData);
      });
  }
  else
    return Promise.resolve(userGroupData);
};