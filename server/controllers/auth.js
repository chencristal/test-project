'use strict';

var _            = require('lodash');
var passport     = require('passport');
var customErrors = require('n-custom-errors');
var jwtUtil      = require('../util/jwt');

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    err = err || info;
    if (err) {
      err = customErrors.getAccessDeniedError(err.message);
      return next(err);
    }
    user = _.pick(user, ['firstName', 'lastName', 'email', 'role']);
    jwtUtil
      .signToken(user, user.role)
      .then(token => res.send({ user, token }))
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
