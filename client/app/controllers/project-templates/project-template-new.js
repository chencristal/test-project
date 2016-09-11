'use strict';

angular.module('app').controller('ProjectTemplateNewCtrl',
  function($scope, $location, Notifier,
           ProjectTemplate, DocumentTemplate) {

  $scope.projectTemplate = new ProjectTemplate({
    style: 'normal'
  });
  $scope.isNew = true;
  $scope.isSaving = false;
  $scope.documentTemplates = [];

  $scope.refreshDocumentTemplates = function(query) {
    if (!query) {
      return [];
    }
    return DocumentTemplate
      .query({ query: query })
      .$promise
      .then(function(docTempls) {
        $scope.documentTemplates = docTempls;
      });
  };

  $scope.createProjectTemplate = function() {
    $scope.isSaving = true;
    $scope.projectTemplate
      .$save()
      .then(function() {
        Notifier.info('New projectTemplate created successfully');
        $location.path('/project-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
