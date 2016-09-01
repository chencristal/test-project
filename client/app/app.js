'use strict';

angular.module('app', [
  'ngResource',
  'ngRoute',
  'ui.bootstrap'
])
.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  
  $routeProvider
    .when('/not-found', {
      templateUrl: 'views/not-found.html',
    })
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })
    /* TODO: use real endpoints
    .when('/users', {
      templateUrl: 'views/users/users-list.html',
      controller: 'UsersListCtrl'
    })
    .when('/users/new', {
      templateUrl: 'views/users/user-new.html',
      controller: 'UserNewCtrl'
    })
    .when('/users/:_id', {
      templateUrl: 'views/users/user-details.html',
      controller: 'UserDetailsCtrl'
    })
    .when('/users/:_id/edit', {
      templateUrl: 'views/users/user-edit.html',
      controller: 'UserEditCtrl'
    })*/
    .otherwise({
      redirectTo: '/not-found'
    });
});
