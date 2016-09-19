'use strict';

angular.module('app').controller('ProjectNewCtrl',
  function($scope, $location, Notifier, Project, ProjectTemplate) {

  $scope.project = new Project({});
  $scope.isNew = true;
  $scope.isSaving = false;
  $scope.projectTemplates = [];

  $scope.refreshProjectTemplates = function(query) {
    if (!query) {
      return [];
    }
    return ProjectTemplate
      .query({ query: query })
      .$promise
      .then(function(projTempls) {
        $scope.projectTemplates = projTempls;
      });
  };

  $scope.createProject = function() {
    $scope.isSaving = true;
    $scope.project
      .$save()
      .then(function() {
        Notifier.info('New project created successfully');
        $location.path('/projects');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
