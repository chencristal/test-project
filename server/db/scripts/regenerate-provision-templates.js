'use strict';

var _                 = require('lodash');
var mongoose          = require('mongoose');
var Promise           = require('bluebird');
var db                = require('../');
var log               = require('../../util/logger').logger;
var templProc         = require('../../util/template-processor');
var ProvisionTemplate = mongoose.model('provisionTemplate');
var TermTemplate      = mongoose.model('termTemplate');

function regenerateProvisionTemplates() {
  return Promise
    .all([
      ProvisionTemplate.find({}, 'template'),
      TermTemplate.find({})
    ])
    .spread((provTempls, termTempls) => {
      return Promise.each(provTempls, provTempl =>_updateTemplate(provTempl, termTempls));
    });
}

function _updateTemplate(provTempl, termTempls) {
  return templProc
    .parse(provTempl.template)
    .then(tokensRoot => {
      return templProc
        .generate(tokensRoot, termTempls)
        .then(html => {
          var variables = _.map(termTempls, 'variable');
          var usedVariables = templProc.getUsedVariables(tokensRoot, variables);
          var usedTermTempls = _.filter(termTempls, tt => _.includes(usedVariables, tt.variable));
          provTempl.termTemplates = usedTermTempls;
          provTempl.templateHtml = html;
          provTempl.orderedVariables = usedVariables;
          return provTempl.save();
        });
    });
}

db
  .connect()
  .then(regenerateProvisionTemplates)
  .then(() => log.info('The script has been applied succesfully'))
  .catch(err => log.error('The script has not been applied', err, err.stack))
  .finally(db.disconnect);
