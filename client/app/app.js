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
    .when('/term-templates', {
      templateUrl: 'views/term-templates/term-templates-list.html',
      controller: 'TermTemplatesListCtrl'
    })
    .when('/term-templates/new', {
      templateUrl: 'views/term-templates/term-template-new.html',
      controller: 'TermTemplateNewCtrl'
    })
    .when('/term-templates/:_id', {
      templateUrl: 'views/term-templates/term-template-details.html',
      controller: 'TermTemplateDetailsCtrl'
    })
    .when('/term-templates/:_id/edit', {
      templateUrl: 'views/term-templates/term-template-edit.html',
      controller: 'TermTemplateEditCtrl'
    })
    .otherwise({
      redirectTo: '/not-found'
    });
});
