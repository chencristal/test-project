'use strict';

var _          = require('lodash');
var handlebars = require('handlebars');

_.extend(module.exports, require('./compiler'));
_.extend(module.exports, require('./generator'));
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
      

//
// chen_debug
//
handlebars.registerHelper('math', (v1, op, v2) => {
  /* jshint maxcomplexity: false */  
  var parse_date = (param) => {
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[param.getMonth()] + ' ' + 
      param.getDate() + ', ' + 
      param.getFullYear();
  }

  var is_date_operation = false;
  var date1;

  if (isNaN(parseInt(v1))) {  // chen_debug
    date1 = new Date(v1);
    is_date_operation = true;
  }
  else {
    v1 = parseInt(v1);
  }
  v2 = parseInt(v2);

  if (is_date_operation) {
    switch (op) {
      case 'add':
      case 'add-date':
      case 'add-day':
        date1.setDate(date1.getDate() + v2);
        return parse_date(date1);
      case 'add-month':
        date1.setMonth(date1.getMonth() + v2);
        return parse_date(date1);
      case 'add-year':
        date1.setFullYear(date1.getFullYear() + v2);
        return parse_date(date1);
      default:
        throw new Error('Invalid operator');
    }
  } 
  else {
    switch (op) {
      case 'add':
      case 'plus':
        return v1 + v2;
      case 'subtract':
      case 'minus':
        return v1 - v2;
      case 'multiply':
      case 'multiplied by':
        return v1 * v2;
      case 'divide':
      case 'divided by':
        return v1 / v2;
      case 'modulus':
      case 'modulo':
        return v1 % v2;
      default:
        throw new Error('Invalid operator');
    }
  }
});

handlebars.registerHelper('ifVariant', (v, opt, options) => {
  return v === opt ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('case', (op,v) => {
  var camelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  }
  var titleCase = (str) => {
    return str.toLowerCase().replace(/\b[a-z]/g, firstLetter => {return firstLetter.toUpperCase();})
  }

  v = v.toString();
  switch(op) {
    case 'lower':
      return v.toLowerCase();
    case 'upper':
      return v.toUpperCase();
    case 'title':
      return titleCase(v);
    default:
      throw new Error('Invalid operator');
  }
});

handlebars.registerHelper('add', (v1,v2,options) => {
  return 'test';
});
