'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var config     = require('../config/environment');
var log        = require('./util/logger');

module.exports = function(app) {
  app.set('views', config.get('viewsPath'));
  app.set('port', config.get('port'));
  app.set('view engine', 'pug');

  app.use(express.static(config.get('publicPath')));

  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test') {
    app.use(log.common);
  }
  // TODO: uncomment for favicon:
  // app.use(favicon(path.join(config.get('rootPath'), 'client', 'images', 'favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
};
