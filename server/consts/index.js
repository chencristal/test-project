'use strict';

module.exports = {
  USER: {
    ROLES: ['admin', 'user'],
    STATUSES: ['active', 'inactive']
  },
  TERM_TYPES: ['text', 'boolean', 'variant', 'date', 'number'],
  PROVISION_STYLES: ['sheet', 'normal'],
  HANDLEBAR: {
    STATEMENTS: ['if', 'unless', 'ifCond', 'ifVariant'],
    IFCOND_OPERATORS: ['and', 'not-and', 'and-not', 'not-and-not', 'or', 'not-or', 'or-not', 'not-or-not']
  },
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};
