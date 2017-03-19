'use strict';

angular.module('app').controller('ProjectsListCtrl',
  function($scope, $location, Notifier, Project) {
  $scope.isLoading = true;
  $scope.loadData = function() {
    Project
      .query()
      .$promise
      .then(function(projects) {
        $scope.projects = projects;
        $scope.isLoading = false;
      });

    Project
      .query({type: 'shared'})
      .$promise
      .then(function(shared_projects) {
        $scope.sharedProjects = shared_projects;
        $scope.isLoading = false;
      });
  }
  $scope.loadData();

  $scope.editProject = function(project) {
    $location.path('/projects/' + project._id + '/edit');
  };
  $scope.shareProject = function(project) {
    $location.path('/projects/' + project._id + '/share');
  };

  $scope.openEditor = function(project) {
    $location.path('/projects/' + project._id + '/editor');
  };

  $scope.deleteProject = function(project) {
    $scope.isLoading = true;
    project
      .$delete()
      .then(function() {
        Notifier.info('Project removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        $scope.isLoading = false;
        Notifier.error(err, 'Unable to remove project');
      })
  };
});
