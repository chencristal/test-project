'use strict';

angular.module('app', [
  'ngResource',
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  'textAngular'
])
.config(function($routeProvider, $locationProvider, $httpProvider) {
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('HttpInterceptor');

  $routeProvider
    .when('/not-found', {
      templateUrl: 'views/not-found.html',
    })
    .when('/', {
      templateUrl: 'views/home.html',
    })

    .when('/login', {
      templateUrl: 'views/account/login.html',
      controller: 'AccountLoginCtrl'
    })
    .when('/forget-password', {
      templateUrl: 'views/account/forget-password.html',
      controller: 'AccountForgetPasswordCtrl'
    })
    .when('/restore-password', {
      templateUrl: 'views/account/restore-password.html',
      controller: 'AccountRestorePasswordCtrl'
    })

    .when('/users', {
      templateUrl: 'views/users/users-list.html',
      controller: 'UsersListCtrl'
    })
    .when('/users/new', {
      templateUrl: 'views/users/user-new.html',
      controller: 'UserNewCtrl'
    })
    .when('/users/:_id/edit', {
      templateUrl: 'views/users/user-edit.html',
      controller: 'UserEditCtrl'
    })

    .when('/term-templates', {
      templateUrl: 'views/term-templates/term-templates-list.html',
      controller: 'TermTemplatesListCtrl'
    })
    .when('/term-templates/new', {
      templateUrl: 'views/term-templates/term-template-new.html',
      controller: 'TermTemplateNewCtrl'
    })
    .when('/term-templates/:_id/edit', {
      templateUrl: 'views/term-templates/term-template-edit.html',
      controller: 'TermTemplateEditCtrl'
    })

    .otherwise({
      redirectTo: '/not-found'
    });
});
