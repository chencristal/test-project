'use strict';

var express = require('express');
var config  = require('../config/environment');
var db      = require('./db');
var log     = require('./util/logger').logger;

require('./util/promisify');
require('./util/errors');

var app = express();
require('./express')(app);
require('./routes')(app);
require('./auth/strategies')();

if (app.get('env') !== 'test') {
  db.connect();

  app.listen(app.get('port'), function() {
    log.info('Express server started', 'environment=' + config.get('env'), 'listening on port=' + config.get('port'));
  });
}

module.exports = app;
