'use strict';

angular.module('app').controller('DocumentTemplateEditCtrl',
  function($scope, $q, $routeParams, $location, Notifier,
           DocumentTemplate, DocumentTemplateType, ProvisionTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.provisionTemplates = [];

  (function loadData() {
    DocumentTemplate
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(docTempl) {
        $scope.documentTemplate = docTempl;
        return $q.all([
          DocumentTemplateType.query({ 'includes[]': [docTempl.documentType] }),
          ProvisionTemplate.query({ 'includes[]': docTempl.provisionTemplates })
        ]);
      })
      .then(function(results) {
        $scope.documentTypes = results[0];
        $scope.provisionTemplates = results[1];
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/document-templates');
      });
  })();

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

  $scope.saveDocumentTemplate = function() {
    $scope.isSaving = true;
    $scope.documentTemplate
      .$update()
      .then(function() {
        Notifier.info('DocumentTemplate updated successfully');
        $location.path('/document-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
