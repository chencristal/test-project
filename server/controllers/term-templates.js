'use strict';

var _              = require('lodash');
var Promise        = require('bluebird');
var fs             = require('fs');
var customErrors   = require('n-custom-errors');
var consts         = require('../consts');
var termTsSrvc     = require('../data-services/term-templates');
var validationUtil = require('../util/validations');

exports.getTermTemplates = (req, res, next) => {
  function parseParams(query) {
    var data = {
      includes: query.includes
    };
    data.fields = req.query.fields || ['displayName'];
    return Promise.resolve(data);
  }

  function validateParams(data) {
    var allowedFields = [
      '*', 'termType', 'variable', 'text', 'boolean',
      'variant', 'date', 'displayName', 'help', 'disabled', 'state'
    ];

    if (data.includes && !_.every(data.includes, validationUtil.isValidObjectId)) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'includes',
        errMsg: 'must be an array with valid ids'
      });
    }
    if (!_.every(data.fields, field => _.includes(allowedFields, field))) {
      return customErrors.rejectWithUnprocessableRequestError({
        paramName: 'fields',
        errMsg: 'must be an array with valid fields'
      });
    }
    return data;
  }

  function buildFilter(data) {
    data.filter = {};
    if (data.includes) {
      data.filter._id = {
        $in: data.includes
      };
    }
    if (_.get(data, 'fields[0]') === '*') {
      data.fields = ['-__v'];
    }
    return data;
  }

  parseParams(req.query)
    .then(validateParams)
    .then(buildFilter)
    .then(data => termTsSrvc.getTermTemplates(data.filter, data.fields.join(' ')))
    .then(termTempls => res.send(termTempls))
    .catch(next);
};

exports.getTermTemplateById = (req, res, next) => {
  var termTemplId = req.params._id;

  function validateParams() {
    if (!validationUtil.isValidObjectId(termTemplId)) {
      return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
    }
    return Promise.resolve();
  }

  validateParams()
    .then(() => termTsSrvc.getTermTemplate({ _id: termTemplId }, '-__v'))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.createTermTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['termType', 'variable', 'displayName', 'help', 'text','expandable_text', 'textarea', 'boolean', 'variant', 'date', 'number', 'state'];
    var termTemplData = _.pick(body, allowedFields);
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    return _validateTermTemplData(termTemplData);
  }

  function doEdits(termTemplData) {
    var termTempl = _.assign({}, termTemplData);
    return termTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(doEdits)
    .then(termTempl => termTsSrvc.createTermTemplate(termTempl))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.updateTermTemplate = (req, res, next) => {
  function parseParams(body) {
    var allowedFields = ['termType', 'variable', 'displayName', 'help', 'text','expandable_text', 'textarea', 'boolean', 'variant', 'date', 'number', 'state'];
    var termTemplData = _.pick(body, allowedFields);
    termTemplData._id = req.params._id;
    return Promise.resolve(termTemplData);
  }

  function validateParams(termTemplData) {
    return _validateId(termTemplData._id).then(() => _validateTermTemplData(termTemplData));
  }

  function doEdits(data) {
    delete data.termTemplData.termType;
    delete data.termTemplData.variable;
    _.extend(data.termTempl, data.termTemplData);
    return data.termTempl;
  }

  parseParams(req.body)
    .then(validateParams)
    .then(termTemplData => termTsSrvc
      .getTermTemplate({ _id: termTemplData._id })
      .then(termTempl => {
        return { termTempl, termTemplData };
      })
    )
    .then(doEdits)
    .then(termTempl => termTsSrvc.saveTermTemplate(termTempl))
    .then(termTempl => res.send(termTempl))
    .catch(next);
};

exports.disableTermTemplate = (req, res, next) => {
  var termTemplId = req.params._id;

  _validateId(termTemplId)
    .then(() => termTsSrvc.getTermTemplate({ _id: termTemplId }))
    .then(termTempl => {
      termTempl.disabled = true;
      return termTsSrvc.saveTermTemplate(termTempl);
    })
    .then(() => res.status(203).end())
    .catch(next);
};

exports.enableTermTemplate = (req, res, next) => {
  var termTemplId = req.params._id;

  _validateId(termTemplId)
    .then(() => termTsSrvc.getTermTemplate({ _id: termTemplId }))
    .then(termTempl => {
      termTempl.disabled = false;
      return termTsSrvc.saveTermTemplate(termTempl);
    })
    .then(() => res.status(203).end())
    .catch(next);
};

exports.importFromCSV = (req, res, next) => {
  var records = req.body;
  if(!Array.isArray(records) || records.length < 2)
    res.send('No variables to import');

  for(var i = 1; i < records.length; i ++) {
    var record = records[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    if(record.length < 3) continue;
    if (!_.includes(consts.TERM_TYPES, record[0]) || record[1].trim() == '')
      continue;
    var data = {};
    data.termType = record[0];
    data.variable = record[1];
    data.displayName = record[2];
    data.help = record[3] ? record[3] : '';
    data.help = data.help.replace(/\"/g,'');
    data.state = 0;
    data.disabled = false;
    switch(record[0]) {
      case 'text':
        var placeholder = record[4] ? record[4] : '[ ]';
        placeholder = placeholder.replace(/\"/g,'');
        data.text = { placeholder: placeholder };
      break;
      case 'boolean':
        var placeholder = record[4].toLowerCase() == 'true' ? true : false;
        var inclusion = record[5] ? record[5] : 'Include';
        inclusion = inclusion.replace(/\"/g,'');
        var exclusion = record[6] ? record[6] : 'Exclude';
        exclusion = exclusion.replace(/\"/g,'');
        data.boolean = { default: placeholder, inclusionText: inclusion, exclusionText: exclusion };
      break;
      case 'variant':
        var opts = record.slice(5);
        var options = [];
        for(var j = 0; j < opts.length; j ++)
          if(opts[j] != '')
            options.push({id: j+1, value: opts[j].replace(/\"/g,'')});
        var placeholder = record[4] ? record[4] : '0';
        placeholder = placeholder.replace(/\"/g,'');
        if(options.length == 0 && placeholder != '0')
          options.push({id: 1, value: placeholder});
        data.variant = { default: placeholder, displayAs: 'dropdown', options: options };
      break;
      case 'date':
        placeholder = record[4] ? record[4] : '';
        data.date = { default: placeholder };
      break;
      case 'number':
        var placeholder = parseFloat(record[4])? parseFloat(record[4]) : 0;
        data.number = { placeholder: placeholder };
      break;
    }    
    
    termTsSrvc.createTermTemplateFromCSV(data);
  }

  res.send('Import of ' + (records.length - 1) + ' records completed successfully');
};
exports.generateCSV = (req, res, next) => {
  function convert(termTempls) {
    var output = '';
    output += 'TermType,Variable,DisplayName,Help,Default,Option1,Option2';
    for(var i = 0; i < termTempls.length; i ++) {
      output += '\r\n';
      var termTempl = termTempls[i];
      if(!termTempl.help)
        termTempl.help = '';
      termTempl.variable = termTempl.variable;
      termTempl.displayName = termTempl.displayName.replace(/,/g, ' ');
      termTempl.help = '"' + termTempl.help + '"';
      output += termTempl.termType + ',' + termTempl.variable + ',' + termTempl.displayName + ',' + termTempl.help;
      if(termTempl.termType == 'text')
        output += ',' + '"' + termTempl.text.placeholder + '"';
      else if(termTempl.termType == 'boolean') {
        output += ',' + termTempl.boolean.default;
        output += ',' + '"' + termTempl.boolean.inclusionText + '"';
        output += ',' + '"' + termTempl.boolean.exclusionText + '"';
      }
      else if(termTempl.termType == 'variant') {
        output += ',' + '"' + termTempl.variant.default + '"';
        if(termTempl.variant.options.length > 0) {
          for(var j = 0; j < termTempl.variant.options.length; j ++)
            output += ',' + '"' + termTempl.variant.options[j].value + '"';
        }
      }
      else if(termTempl.termType == 'date')
        output += ',' + termTempl.date.default;
      else if(termTempl.termType == 'number')
        output += ',' + termTempl.number.placeholder;
    }
    return output;
  }
  termTsSrvc.getTermTemplates({})
  .then(convert)
  .then(csv => {
    res.setHeader('Content-disposition', 'attachment; filename=termtemplates.csv');
    res.setHeader('Content-type', 'text/csv; charset=utf-8');
    res.status(200).send(csv);
  })
  .catch(next);
};

function _validateId(termTemplId) {
  if (!validationUtil.isValidObjectId(termTemplId)) {
    return customErrors.rejectWithUnprocessableRequestError({ paramName: 'id', errMsg: 'must be a valid id' });
  }
  return Promise.resolve(termTemplId);
}

function _validateTermTemplData(termTemplData) {
  if (!_.includes(consts.TERM_TYPES, termTemplData.termType)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'termType', errMsg: 'must be defined and has a valid value' }
    );
  }
  if (!termTemplData.variable) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variable', errMsg: 'is required' }
    );
  }
  if (!termTemplData.variable.match(/^[A-Za-z0-9_]+$/)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variable', errMsg: 'must contains only valid chars:<br/>A-Z, a-z, 0-9 or underscore' }
    );
  }
  if (!termTemplData.displayName) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'displayName', errMsg: 'is required' }
    );
  }

  switch (termTemplData.termType) {
    case 'text':
      return validateTextTermType(termTemplData);
    case 'boolean':
      return validateBooleanTermType(termTemplData);
    case 'variant':
      return validateVariantTermType(termTemplData);
    case 'date':
      return validateDateTermType(termTemplData);
  }

  return Promise.resolve(termTemplData);
}

function validateTextTermType(termTemplData) {
  if (!_.get(termTemplData, 'text.placeholder')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'text.placeholder', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}

function validateDateTermType(termTemplData) {
  if (!_.get(termTemplData, 'date.placeholder')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'date.placeholder', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}

function validateBooleanTermType(termTemplData) {
  if (!_.get(termTemplData, 'boolean.inclusionText')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.inclusionText', errMsg: 'is required' }
    );
  }
  if (!_.get(termTemplData, 'boolean.exclusionText')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.exclusionText', errMsg: 'is required' }
    );
  }
  var def = _.get(termTemplData, 'boolean.default');
  if (!_.isBoolean(def)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'boolean.default', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}

function validateVariantTermType(termTemplData) {
  var opts = _.get(termTemplData, 'variant.options');
  var defValue = _.get(termTemplData, 'variant.default');

  if (!_.isArray(opts) || opts.length === 0) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.options', errMsg: 'must be not empty array' }
    );
  }
  var optValues = _(opts).map('value').uniq().value();
  if (optValues.length !== opts.length) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.options', errMsg: 'shouldn\'t have duplicates' }
    );
  }
  if (!_.includes(optValues, defValue)) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.default', errMsg: 'must be defined and matched with one of the options' }
    );
  }
  if (!_.get(termTemplData, 'variant.displayAs')) {
    return customErrors.rejectWithUnprocessableRequestError(
      { paramName: 'variant.displayAs', errMsg: 'is required' }
    );
  }
  return Promise.resolve(termTemplData);
}
