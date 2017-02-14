'use strict';

var _          = require('lodash');
var handlebars = require('handlebars');

_.extend(module.exports, require('./compiler'));
_.extend(module.exports, require('./generator'));
_.extend(module.exports, require('./parser'));
_.extend(module.exports, require('./validator'));

handlebars.registerHelper('ifCond', (op, v1, v2, options) => {
  /* jshint maxcomplexity: false */
  console.log(op);
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
      

//
// chen_debug
//
handlebars.registerHelper('math', (v1, op, v2) => {
  /* jshint maxcomplexity: false */
  console.log(op);
  switch (op) {
    case 'add':
      return v1 + v2;
    case 'substract':
      return v1 - v2;
    case 'multiply':
      return v1 * v2;
    case 'divide':
      return v1 / v2;
    default:
      throw new Error('Invalid operator');
  }
});

handlebars.registerHelper('ifVariant', (v, opt, options) => {
  return v === opt ? options.fn(this) : options.inverse(this);
});
