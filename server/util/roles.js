'use strict';

var _ = require('lodash');

var _roleNames = [
    { label: 'Super Admin', value: 'superadmin', flag: 31 },
    { label: 'Admin', value: 'admin', flag: 15 },
    { label: 'Author', value: 'author', flag: 7 },
    { label: 'User', value: 'user', flag: 3 },
  ];

module.exports = {
  getLowerRolesFilters: function(role) {
    if (role == 'superadmin' || role == 'admin') {
      return [
        {role: 'admin'},
        {role: 'author'},
        {role: 'user'},
      ];
    }
    else if (role == 'author') {
      return [
        {role: 'author'},
        {role: 'user'},
      ];
    }
    else if (role == 'user') {
      return [
        {role: 'user'},
      ];
    }
  },
  getRoleInfo: function(role) {
    return _.find(_roleNames, {'value': role});
  }
};
