'use strict';

angular.module('app').controller('ProjectsListCtrl',
  function($scope, $location, Notifier, Project) {

  $scope.isLoading = true;

  (function loadData() {
    Project
      .query()
      .$promise
      .then(function(projects) {
        $scope.projects = projects;
        $scope.isLoading = false;
      });
  })();

  $scope.editProject = function(project) {
    $location.path('/projects/' + project._id + '/edit');
  };

  $scope.openProcessor = function(project) {
    $location.path('/projects/' + project._id + '/processor');
  };
});
