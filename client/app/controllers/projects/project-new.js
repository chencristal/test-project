'use strict';

angular.module('app').controller('ProjectNewCtrl',
  function($scope, $location, Notifier, Project, ProjectTemplate) {

  $scope.project = new Project({});
  $scope.isNew = true;
  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.projectTemplates = [];

  (function loadData() {
    ProjectTemplate
      .query({ status: 'active' })
      .$promise
      .then(function(projectTemplates) {
        $scope.projectTemplates = projectTemplates;
      })
      .finally(function() {
        $scope.isLoading = false;
      });
  })();

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
