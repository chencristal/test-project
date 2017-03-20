'use strict';

var _            = require('lodash');
var passport     = require('passport');
var customErrors = require('n-custom-errors');
var jwtUtil      = require('../util/jwt');
var acl          = require('../auth/acl');

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    err = err || info;
    if (err) {
      err = customErrors.getAccessDeniedError(err.message);
      return next(err);
    }
    user = _.pick(user, ['firstName', 'email', 'role', 'userGroups']);
    acl.userRoles(user)
      .then(roles => {
        user.role = roles[0];
        return jwtUtil.signToken(user, user.role);
      })
      .then(token => {
        return res.send({ user, token });
      })
      .catch(next);
  })(req, res, next);
};

// TODO: implement
exports.logout = (req, res) => {
  res.status(203).end();
};

// TODO: implement
exports.forgetPassword = (req, res) => {
  res.status(203).end();
};

// TODO: implement
exports.restorePassword = (req, res) => {
  res.status(203).end();
};
