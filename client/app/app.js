'use strict';

angular.module('app', [
  'ngResource',
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  'ui.select',
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

    .when('/provision-templates', {
      templateUrl: 'views/provision-templates/provision-templates-list.html',
      controller: 'ProvisionTemplatesListCtrl'
    })
    .when('/provision-templates/new', {
      templateUrl: 'views/provision-templates/provision-template-new.html',
      controller: 'ProvisionTemplateNewCtrl'
    })
    .when('/provision-templates/:_id/edit', {
      templateUrl: 'views/provision-templates/provision-template-edit.html',
      controller: 'ProvisionTemplateEditCtrl'
    })

    .when('/document-template-types', {
      templateUrl: 'views/document-template-types/document-template-types-list.html',
      controller: 'DocumentTemplateTypesListCtrl'
    })
    .when('/document-template-types/new', {
      templateUrl: 'views/document-template-types/document-template-type-new.html',
      controller: 'DocumentTemplateTypeNewCtrl'
    })
    .when('/document-template-types/:_id/edit', {
      templateUrl: 'views/document-template-types/document-template-type-edit.html',
      controller: 'DocumentTemplateTypeEditCtrl'
    })

    .when('/document-templates', {
      templateUrl: 'views/document-templates/document-templates-list.html',
      controller: 'DocumentTemplatesListCtrl'
    })
    .when('/document-templates/new', {
      templateUrl: 'views/document-templates/document-template-new.html',
      controller: 'DocumentTemplateNewCtrl'
    })
    .when('/document-templates/:_id/edit', {
      templateUrl: 'views/document-templates/document-template-edit.html',
      controller: 'DocumentTemplateEditCtrl'
    })

    .when('/project-templates', {
      templateUrl: 'views/project-templates/project-templates-list.html',
      controller: 'ProjectTemplatesListCtrl'
    })
    .when('/project-templates/new', {
      templateUrl: 'views/project-templates/project-template-new.html',
      controller: 'ProjectTemplateNewCtrl'
    })
    .when('/project-templates/:_id/edit', {
      templateUrl: 'views/project-templates/project-template-edit.html',
      controller: 'ProjectTemplateEditCtrl'
    })

    .when('/projects', {
      templateUrl: 'views/projects/projects-list.html',
      controller: 'ProjectsListCtrl'
    })
    .when('/projects/new', {
      templateUrl: 'views/projects/project-new.html',
      controller: 'ProjectNewCtrl'
    })
    .when('/projects/:_id/edit', {
      templateUrl: 'views/projects/project-edit.html',
      controller: 'ProjectEditCtrl'
    }).when('/projects/:_id/editor', {
      templateUrl: 'views/projects/project-editor.html'
    })

    .otherwise({
      redirectTo: '/not-found'
    });
});

angular.module('app').run(function($rootScope) {
  $rootScope.ifCond = function(op, v1, v2) {
    switch (op) {
      case 'and':
        return (v1 && v2);
      case 'not-and':
        return (!v1 && v2);
      case 'and-not':
        return (v1 && !v2);
      case 'not-and-not':
        return (!v1 && !v2);
      case 'or':
        return (v1 || v2);
      case 'not-or':
        return (!v1 || v2);
      case 'or-not':
        return (v1 || !v2);
      case 'not-or-not':
        return (!v1 || !v2);
    }
  };

  $rootScope.ifVariant = function(v, opt) {
    return v === opt;
  };
});