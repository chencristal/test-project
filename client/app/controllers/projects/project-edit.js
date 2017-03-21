'use strict';

angular.module('app').controller('ProjectEditCtrl',
  function($scope, $routeParams, $location, Notifier, Project, 
          ProjectTemplate, User, UserGroup) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.projectTemplates = [];
  $scope.users = [];
  $scope.userGroups = [];

  (function loadData() {
    Project
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(project) {
        project.projectTemplate = project.projectTemplate._id;
        $scope.project = project;
        return ProjectTemplate.query({}).$promise;
      })
      .then(function(projectTemplates) {
        $scope.projectTemplates = projectTemplates;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/projects');
      })
      .finally(function() {
        $scope.isLoading = false;
      });
  })();

  $scope.refreshUserGroups = function(query) {
    return UserGroup
      .query({ query: query, role: 'user'})
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
      });
  };

  $scope.refreshUsers = function(query) {
    return User
      .query({ query: query, role: 'user' })
      .$promise
      .then(function(users) {
        $scope.users = users;
      });
  };

  $scope.saveProject = function() {
    $scope.isSaving = true;
    $scope.project
      .$update()
      .then(function() {
        Notifier.info('Project updated successfully');
        $location.path('/projects');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
