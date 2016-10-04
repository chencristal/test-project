'use strict';

module.exports = {
  USER: {
    ROLES: ['admin', 'user'],
    STATUSES: ['active', 'inactive']
  },
  TERM_TYPES: ['text', 'boolean', 'variant', 'date'],
  PROVISION_STYLES: ['sheet', 'normal'],
  HANDLEBAR: {
    EXPRESSIONS: ['if', 'unless', 'ifCond'],
    IF_LITERALS: ['and', 'not-and', 'and-not', 'not-and-not', 'or', 'not-or', 'or-not', 'not-or-not']
  }
};
