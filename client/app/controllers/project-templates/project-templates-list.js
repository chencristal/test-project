'use strict';

angular.module('app').controller('ProjectTemplatesListCtrl',
  function($scope, $location, Notifier, ProjectTemplate) {

  $scope.isLoading = true;

  (function loadData() {
    ProjectTemplate
      .query()
      .$promise
      .then(function(projectTemplates) {
        $scope.projectTemplates = projectTemplates;
        $scope.isLoading = false;
      });
  })();

  $scope.editProjectTemplate = function(projectTemplate) {
    $location.path('/project-templates/' + projectTemplate._id + '/edit');
  };
});
