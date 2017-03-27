'use strict';

angular.module('app').controller('ProjectTemplatesListCtrl',
  function($scope, $location, Notifier, ProjectTemplate) {

  $scope.isLoading = true;

  $scope.loadData = function() {
    ProjectTemplate
      .query()
      .$promise
      .then(function(projectTemplates) {
        $scope.projectTemplates = projectTemplates;
        $scope.isLoading = false;
      });
  };
  $scope.loadData();

  $scope.editProjectTemplate = function(projectTemplate) {
    $location.path('/project-templates/' + projectTemplate._id + '/edit');
  };

  $scope.setProjectTemplateStatus = function(projectTemplate, status) {
    $scope.isSaving = true;
    projectTemplate.status = status;
    projectTemplate
      .$update()
      .then(function() {
        Notifier.info('Project template updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.deleteProjectTemplate = function(projectTemplate) {
    $scope.isSaving = true;
    projectTemplate
      .$delete()
      .then(function() {
        Notifier.info('Project template removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to remove project template');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
