'use strict';

var _        = require('lodash');
var Promise  = require('bluebird');
var mongoose = require('mongoose');
var db       = require('../../server/db');
var acl      = require('../../server/auth/acl');
var testUtil = require('./test-util');
require('sinon-as-promised')(Promise);
require('../../server/util/errors');

before(done => {
  db
    .connect()
    .then(_clearDb)
    .then(() => testUtil.seedUsers())
    .then(() => testUtil.seedUserGroups())
    .then(() => testUtil.seedInstitutions())
    .then(() => testUtil.seedTermTemplates())
    .then(() => testUtil.seedProvisionTemplates())
    .then(() => testUtil.seedDocumentTemplateTypes())
    .then(() => testUtil.seedDocumentTemplates())
    .then(() => testUtil.seedProjectTemplates())
    .then(() => testUtil.seedProjects())
    .then(() => acl.initialize(db.connection))
    .then(() => done())
    .catch(done);
});

/*afterEach(done => {
  _clearDb()
    .then(() => done())
    .catch(done);
});*/

after(done => {
  _clearDb()
    .then(db.disconnect)
    .then(() => done())
    .catch(done);
});

function _clearDb() {
  var ops = _(mongoose.models)
    .keys()
    .map(modelName => mongoose.model(modelName).remove())
    .value();

  return Promise.all(ops);
}
