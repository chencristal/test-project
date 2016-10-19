'use strict';

var _    = require('lodash');
var argv = require('yargs').argv;
var log  = require('../../util/logger').logger;

var scripts = [
  'fix-variable-names',
  'regenerate-provision-templates'
];

if (!argv.script) {
  log.error('Script name must be defined, for example db:scripts -- --update-users');
} else if (_.includes(scripts, argv.script)) {
  require('./' + argv.script);
} else {
  log.error('Unknown script');
}
