'use strict';

var log = require('../util/logger').logger;

module.exports = app => {
  require('./auth')(app);
  require('./users')(app);
  require('./term-templates')(app);
  require('./provision-templates')(app);
  require('./document-template-types')(app);
  require('./document-templates')(app);
  require('./project-templates')(app);
  require('./projects')(app);

  app.use('/api', (req, res, next) => {
    var err = new Error('Invalid API end point');
    err.statusCode = 404;
    next(err);
  });

  app.get('*', function(req, res) {
    res.render('index', {
      version: '0.0.1'
    });
  });

  /* jshint unused: false */
  app.use((err, req, res, next) => {
    if (err.statusCode < 500) {
      var errData = { reason: err.message, info: err.info };
      res.status(err.statusCode).send(errData);
    } else {
      switch (process.env.NODE_ENV) {
        case 'test':
        case 'development':
          console.log('Unexpected server error', err, err.stack);
          break;
        case 'production':
          log.error('Unexpected server error', err);
          break;
      }
      err = new Error('Unexpected server error');
      err.statusCode = err.statusCode || 500;
      next(err);
    }
  });

  app.use(log.error);
};
