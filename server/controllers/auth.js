'use strict';

var _            = require('lodash');
var passport     = require('passport');
var customErrors = require('n-custom-errors');
var util         = require('../util');

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    err = err || info;
    if (err) {
      err = customErrors.getAccessDeniedError(err.message);
      return next(err);
    }
    user = _.pick(user, ['firstName', 'lastName', 'email', 'role']);
    util
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
