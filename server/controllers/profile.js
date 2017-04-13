'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var usersSrvc      = require('../data-services/users');
var jwtUtil        = require('../util/jwt');
var validationUtil = require('../util/validations');
var acl            = require('../auth/acl');

exports.getProfile = function(req, res, next) {
  usersSrvc
    .getUser({ email: req.user.email }, 'email firstName role status')
    .then(user => res.send(user))
    .catch(next);
};

exports.updateProfile = function(req, res, next) {
  function parseParams(body) {
    var allowedFields = ['_id', 'email', 'firstName', 'password', 'confirmpass'];
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

    if (!_.isArray(userData.userGroups) || userData.userGroups.length === 0 ||
        !_.every(userData.userGroups, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'userGroups',
        errMsg: 'must be an array with valid ids'
      });
    }

    if (!validationUtil.isValidObjectId(userData._id)) {
      return customErrors.rejectWithUnprocessableRequestError({ 
        paramName: 'id', 
        errMsg: 'must be a valid id' 
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
        return acl.removeUser(user); 
      })
      .then(user => {
        return { user, userData };
      })
    )    
    .then(doEdits)
    .then(user => usersSrvc.saveUser(user))
    .then(user => {
      user = _.pick(user, ['firstName', 'email', 'role']);
      jwtUtil
        .signToken(user, user.role)
        .then(token => res.send({ user, token }));
    })
    .catch(next);
};

function _validateUserData(userData) {
  if (!validationUtil.isValidEmail(userData.email)) {
    return customErrors.rejectWithUnprocessableRequestError({
      paramName: 'email',
      errMsg: 'is required and must be a valid email'
    });
  }
  return Promise.resolve(userData);
}
