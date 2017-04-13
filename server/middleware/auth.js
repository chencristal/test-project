'use strict';

var _            = require('lodash');
var customErrors = require('n-custom-errors');
var jwtUtil      = require('../util/jwt');
var acl          = require('../auth/acl');
var usersSrvc    = require('../data-services/users');

exports.ensureAuthenticatedWrapper = (req, res, next) => {
  ensureAuthenticated(req, res, next);
};

exports.requireRoles = (roles) => {
  return (req, res, next) => {
    ensureAuthenticated(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (!req.user || !checkForRoles(req.user, roles)) {
        err = customErrors.getAccessDeniedError('Access denied');
        return next(err);
      }
      next();
    });
  };
};

//
// Routing Permission Middleware
//
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    ensureAuthenticated(req, res, (err) => {
      if (err) {
        return next(err);
      }

      if (!req.user) {
        err = customErrors.getAccessDeniedError('Access denied');
        return next(err);
      }
      else {
        usersSrvc
          .getUser({ email: req.user.email }, 'status')
          .then(user => {
            if (user.status === 'active') {
              return acl.isAllowed(req.user, resource, action);
            } else {
              err = customErrors.getAccessDeniedError('Access denied');
              throw(err);
            }
          })
          .then(user => {
            if (user) {
              return next();
            }
            else {
              err = customErrors.getAccessDeniedError('Access denied');
              throw(err);
            }
          })
          .catch(err => next(err));
      }
    });
  };
};

exports.requireRolesWrapper = (roles) => {
  return exports.requireRoles(roles);
};


function checkForRoles(user, roles) {
  if (_.isString(roles)) {
    roles = [ roles ];
  }
  return _.includes(roles, user.role);
}

function ensureAuthenticated(req, res, next) {
  var token = _.get(req, 'cookies.token');
  token = _.trim(token, '"');
  jwtUtil
    .decodeToken(token)
    .then(data => {
      req.user = data.user;
      return next();
    })
    .catch(() => {
      var err2 = customErrors.getUnauthorizedRequestError('Invalid token');
      next(err2);
    });
}
