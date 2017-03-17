'use strict';

angular.module('app').factory('Identity', function($cookieStore) {
  var _currentUser;
  var _roleNames = [
    { label: 'Super Admin', value: 'superadmin', flag: 31 },
    { label: 'Admin', value: 'admin', flag: 15 },
    { label: 'Author', value: 'author', flag: 7 },
    { label: 'User', value: 'user', flag: 3 },
  ];

  return {
    getCurrentUser: function() {
      if (!_currentUser) {
        _currentUser = this.getUser() || {};
      }
      return _currentUser;
    },

    setCurrentUser: function(user) {
      _currentUser = user || {};
    },

    setTokenAndUser: function(data) {
      $cookieStore.put('token', data.token);
      $cookieStore.put('currentUser', data.user);
    },

    getToken: function() {
      return $cookieStore.get('token');
    },

    getUser: function() {
      return $cookieStore.get('currentUser');
    },

    getRole: function() {
      return _.get(_currentUser, 'role');
    },

    getRoleTitle: function(role) {
      switch (role) {
        case 'superadmin':
          return 'SuperAdmin';
        case 'admin':
          return 'Admin';
        case 'author':
          return 'Author';
        case 'user':
          return 'User';
        default:
          return 'Unknown Role';
      }
    },

    getRoleName: function(role) {
      var _role = _.find(_roleNames, {'value': role});

      return _role;
    },

    getLowerRoleNames: function() {
      var _ret = [];

      this.getCurrentUser();

      var _role = _.find(_roleNames, {'value': _.get(_currentUser, 'role')});
      _.forEach(_roleNames, function(val) {
        if (val.flag < _role.flag) {
          _ret = _.concat(_ret, val);
        }
      });

      return _ret;
    },

    removeTokenAndUser: function() {
      $cookieStore.remove('token');
      $cookieStore.remove('currentUser');
    },

    isLoggedIn: function() {
      return !_.isEmpty(_currentUser);
    },

    isSuperAdmin: function() {
      this.getCurrentUser();
      return _.get(_currentUser, 'role') === 'superadmin';
    },

    isAdmin: function() {
      this.getCurrentUser();
      return _.get(_currentUser, 'role') === 'admin';
    },

    isAuthor: function() {
      this.getCurrentUser();
      return _.get(_currentUser, 'role') === 'author';
    },

    isUser: function() {
      this.getCurrentUser();
      return _.get(_currentUser, 'role') === 'user';
    }
  };
});
