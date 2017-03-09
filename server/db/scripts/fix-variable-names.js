'use strict';

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
var db           = require('../');
var log          = require('../../util/logger').logger;
var TermTemplate = mongoose.model('termTemplate');

function fixVariableNames() {
  return TermTemplate
    .find({})
    .then(termTempls => Promise.each(termTempls, termTempl => {
      termTempl.variable = termTempl.variable.replace(/-|\./g, '_');
      return termTempl.save();
    }));
}

db
  .connect()
  .then(fixVariableNames)
  .then(() => log.info('The script has been applied succesfully'))
  .catch(err => log.error('The script has not been applied', err))
  .finally(db.disconnect);
