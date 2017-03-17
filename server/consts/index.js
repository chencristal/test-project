'use strict';

module.exports = {
  USER: {
    ROLES: ['admin', 'user'],
    STATUSES: ['active', 'inactive']
  },
  TERM_TYPES: ['text', 'expandable_text', 'textarea', 'boolean', 'variant', 'date', 'number'],
  PROVISION_STYLES: ['sheet', 'normal'],
  HANDLEBAR: {
    STATEMENTS: ['if', 'unless', 'ifCond', 'ifVariant', 'unlessVariant', 'math', 'case', 'article', 'pagebreak'],
    MATH_OPERATORS: ['add', 'subtract', 'multiply', 'divide', 'modulus',
                    'plus', 'minus', 'multiplied by', 'divided by', 'modulo', 
                    'add-year', 'add-month', 'add-date', 'add-day'],   // chen_debug
    CASE_OPERATORS: ['lower', 'upper', 'title'],
    IFCOND_OPERATORS: ['and', 'not-and', 'and-not', 'not-and-not', 'or', 'not-or', 'or-not', 'not-or-not']
  },
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};
