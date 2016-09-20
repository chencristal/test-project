'use strict';

angular.module('app').controller('ProjectEditCtrl',
  function($scope, $routeParams, $location, Notifier, Project, ProjectTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.projectTemplates = [];

  (function loadData() {
    Project
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(project) {
        project.projectTemplate = project.projectTemplate._id;
        $scope.project = project;
        return ProjectTemplate.query({ 'includes[]': [project.projectTemplate] }).$promise;
      })
      .then(function(projTempls) {
        $scope.projectTemplates = projTempls;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/projects');
      });
  })();

  $scope.refreshProjectTemplates = function(query) {
    if (!query) {
      return [];
    }
    return ProjectTemplate
      .query({ query: query })
      .$promise
      .then(function(projects) {
        $scope.projectTemplates = projects;
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
