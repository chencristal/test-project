'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var usersSrvc      = require('../data-services/users');
var validationUtil = require('../util/validations');
var roleUtil       = require('../util/roles');

exports.getUsers = function(req, res, next) {
  var role = req.user.role;

  function parseParams(query) {
    var data = {
      params: _.pick(query, ['query', 'role', 'includes', 'institution'])
    };
    data.fields = req.query.fields || [ 'email', 'firstName', 'role', 'status', 'userGroups', 'institutions', 'urlLogin' ];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = [ 'email', 'firstName', 'role', 'status', 'userGroups', 'institutions', 'urlLogin' ];

    if (data.params.includes && !_.every(data.params.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    if (data.params.institution) {
      if ((!data.params.institution instanceof Array && data.params.institution !== 'null') || 
          (data.params.institution instanceof Array && !_.every(data.params.institution, function (elem) {
          if (elem === 'null') {
            return true;
          } else {
            return validationUtil.isValidObjectId(elem);
          }
        }))) 
      {
        return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'institution', 
          errMsg: 'must be a valid id'
        });
      }
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

    if (data.params.institution) {
      if (data.params.institution === 'null') {
        data.filter.institutions = [ ];
      } else {
        data.filter.institutions = _.filter(data.params.institution, function(elem) {
          return (elem !== 'null');
        });
      }
    }
    
    if (data.params.query) {
      data.filter.firstName = {
        $regex: new RegExp(data.params.query, 'i')
      };
    }

    if (data.params.includes) {
      data.filter._id = {
        $in: data.params.includes
      };
    }

    //
    // The user cannot get his own account information.
    //
    data.filter.email = {
      $ne: req.user.email
    };

    return data;
  }

  function resetOrder(users) {
    var orderedUsers = [];
    if(!req.query.includes) {
      res.send(users);
      return;
    }
    _.each(req.query.includes, function(id) {
      var user = _.find(users, d => { return d._id.equals(id); });
      orderedUsers.push(user);
    });
    res.send(orderedUsers);
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => usersSrvc.getUsers(data.filter, data.fields.join(' ')))
    .then(resetOrder)
    .catch(next);
};

exports.getUserById = function(req, res, next) {
  var userId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(userId)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
        paramName: 'id', 
        errMsg: 'must be a valid id'
      });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => usersSrvc.getUser({ _id: userId }, 'email firstName role status userGroups urlLogin'))
    .then(user => _checkPermission(req.user.role, user))
    .then(user => res.send(user))
    .catch(next);
};

exports.createUser = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['email', 'firstName', 'role', 'password', 'confirmpass', 'userGroups', 'urlLogin'];
    var userData = _.pick(body, allowedFields);
    return Promise.resolve(userData);
  }

  function validateParams(userData) {
    if (userData.password && userData.confirmpass) {
      if (userData.password !== userData.confirmpass) {
        return customErrors.rejectWithUnprocessableRequestError({
          paramName: 'Password', 
          errMsg: 'must be confirmed'
        });
      }

      if (userData.password.length < 4) {
        return customErrors.rejectWithUnprocessableRequestError({
          paramName: 'Password', 
          errMsg: 'must be 4 characters at least'
        });
      }
    }
    else {
      return customErrors.rejectWithUnprocessableRequestError({ 
        paramName: 'Password', 
        errMsg: 'field is required'
      });
    }
    return _validateUserData(userData);
  }

  function doEdits(userData) {
    var user = _.assign({}, userData);
    user.status = 'active';
    return user;
  }

  parseParams(req.body)    
    .then(validateParams)
    .then(doEdits)
    .then(user => _checkPermission(req.user.role, user))      // check permissions before create new user
    .then(user => usersSrvc.createUser(user))
    .then(user => res.send(user))
    .catch(next);
};

exports.updateUser = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['email', 'firstName', 'role', 'password', 'confirmpass', 'status', 'userGroups', 'urlLogin'];
    var userData = _.pick(body, allowedFields);
    userData._id = req.params._id;

    return Promise.resolve(userData);
  }

  function validateParams(userData) {
    if (userData.password && userData.confirmpass) {
      if (userData.password !== userData.confirmpass) {
        return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'Password', 
          errMsg: 'must be confirmed'
        });
      }

      if (userData.password.length < 4) {
        return customErrors.rejectWithUnprocessableRequestError({ 
          paramName: 'Password', 
          errMsg: 'must be 4 characters at least'
        });
      }
    }

    if (!validationUtil.isValidObjectId(userData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
        paramName: 'id', 
        errMsg: 'must be a valid id' 
      });
    }
    var allowedStatuses = consts.USER.STATUSES;
    if (!_.includes(allowedStatuses, userData.status)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
        paramName: 'status', 
        errMsg: 'must be a valid value'
      });
    }
    return _validateUserData(userData);
  }

  function doEdits(data) {
    _.extend(data.user, data.userData);
    return data.user;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(userData => usersSrvc
      .getUser({ _id: userData._id })
      .then(user => {
        return { user, userData };
      })
    )    
    .then(doEdits)
    .then(user => _checkPermission(req.user.role, user))
    .then(user => usersSrvc.saveUser(user))
    .then(user => res.send(user))
    .catch(next);
};

function _checkPermission(reqRole, userData) {
  var requestorRole = roleUtil.getRoleInfo(reqRole);
  var newRole = roleUtil.getRoleInfo(userData.role);
  if (requestorRole.flag <= newRole.flag) {
    return customErrors.rejectWithAccessDeniedError();
  }
  return Promise.resolve(userData);
}

function _validateUserData(userData) {
  if (!_.isArray(userData.userGroups) ||
      !_.every(userData.userGroups, validationUtil.isValidObjectId)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'userGroups',
      errMsg: 'must be an array with valid ids'
    });
  }

  if (!validationUtil.isValidEmail(userData.email)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'email',
      errMsg: 'is required and must be a valid email'
    });
  }
  return Promise.resolve(userData);
}
