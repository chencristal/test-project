'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var db       = require('./');
var log      = require('../util/logger').logger;
var User     = mongoose.model('user');

function clearDb() {
  var ops = _(mongoose.models)
    .keys()
    .map(modelName => mongoose.model(modelName).remove())
    .value();

  return Promise.all(ops);
}

function insertUsers() {
  var users = [
    {
      firstName: 'admin',
      email: 'admin@mail.com',
      password: 'passw',
      role: 'admin',
      provider: 'local',
      status: 'active'
    },
    {
      firstName: 'user1',
      email: 'user1@mail.com',
      password: 'passw',
      role: 'user',
      provider: 'local',
      status: 'active'
    },
    {
      firstName: 'user2',
      email: 'user2@mail.com',
      password: 'passw',
      role: 'user',
      provider: 'local',
      status: 'active'
    }
  ];
  return User.create(users);
}

db
  .connect()
  .then(clearDb)
  .then(insertUsers)
  .then(() => log.info('All scripts applied succesfully'))
  .catch(err => log.error('The scripts are not applied', err))
  .finally(db.disconnect);
