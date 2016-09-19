'use strict';

angular.module('app').controller('ProjectEditCtrl',
  function($scope, $routeParams, $location, Notifier, Project) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.documents = [];

  (function loadData() {
    Project
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(proj) {
        $scope.project = proj;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/projects');
      });
  })();

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
