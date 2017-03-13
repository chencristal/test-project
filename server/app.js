'use strict';

var express = require('express');
var path    = require('path');
var config  = require('../config/environment');
var db      = require('./db');
var log     = require('./util/logger').logger;
var acl     = require('./auth/acl');

require('./util/promisify');
require('./util/errors');

var app = express();
app.use('/docs', express.static(path.join(__dirname, '../documentation')));


require('./express')(app);
require('./routes')(app);
require('./auth/strategies')();

if (app.get('env') !== 'test') {
  db.connect();

  app.listen(app.get('port'), function() {
    log.info('Express server started', 'environment=' + config.get('env'), 'listening on port=' + config.get('port'));
  });

  acl.initialize(db.connection);     // ACL Initialization
}

module.exports = app;
