'use strict';

angular.module('app').controller('DocumentTemplateNewCtrl',
  function($scope, $location, Notifier,
           DocumentTemplate, DocumentTemplateType, ProvisionTemplate) {

  $scope.documentTemplate = {
    style: 'normal'
  };
  $scope.isNew = true;
  $scope.isSaving = false;
  $scope.provisionTemplates = [];

  $scope.refreshDocumentTypes = function(query) {
    if (!query) {
      return [];
    }
    return DocumentTemplateType
      .query({ query: query })
      .$promise
      .then(function(docTypes) {
        $scope.documentTypes = docTypes;
      });
  };

  $scope.refreshProvisionTemplates = function(query) {
    if (!query) {
      return [];
    }
    return ProvisionTemplate
      .query({ query: query })
      .$promise
      .then(function(provTempls) {
        $scope.provisionTemplates = provTempls;
      });
  };

  $scope.createDocumentTemplate = function() {
    $scope.isSaving = true;
    var documentTemplate = new DocumentTemplate($scope.documentTemplate);
    documentTemplate
      .$save()
      .then(function() {
        Notifier.info('New documentTemplate created successfully');
        $location.path('/document-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
