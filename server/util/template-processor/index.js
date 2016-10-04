'use strict';

var _          = require('lodash');
var handlebars = require('handlebars');
var moment     = require('moment');

_.extend(module.exports, require('./compiler'));
_.extend(module.exports, require('./generator'));
_.extend(module.exports, require('./compiler'));
_.extend(module.exports, require('./parser'));
_.extend(module.exports, require('./validator'));

handlebars.registerHelper('ifCond', (op, v1, v2, options) => {
  /* jshint maxcomplexity: false */
  switch (op) {
    case 'and':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case 'not-and':
      return (!v1 && v2) ? options.fn(this) : options.inverse(this);
    case 'and-not':
      return (v1 && !v2) ? options.fn(this) : options.inverse(this);
    case 'not-and-not':
      return (!v1 && !v2) ? options.fn(this) : options.inverse(this);
    case 'or':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    case 'not-or':
      return (!v1 || v2) ? options.fn(this) : options.inverse(this);
    case 'or-not':
      return (v1 || !v2) ? options.fn(this) : options.inverse(this);
    case 'not-or-not':
      return (!v1 || !v2) ? options.fn(this) : options.inverse(this);
    default:
      throw new Error('Invalid operator');
  }
});

// TODO: used?
handlebars.registerHelper('today', () => {
  return moment().format('YYYY-MM-DD');
});

// TODO: used?
handlebars.registerHelper('todayAdd', (nDays) => {
  return moment().add(nDays, 'd').format('YYYY-MM-DD');
});
