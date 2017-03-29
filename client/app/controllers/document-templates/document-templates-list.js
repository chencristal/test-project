'use strict';

angular.module('app').controller('DocumentTemplatesListCtrl',
  function($scope, $location, Notifier, DocumentTemplate) {

  $scope.isLoading = true;

  $scope.loadData = function() {
    DocumentTemplate
      .query()
      .$promise
      .then(function(documentTemplates) {
        $scope.documentTemplates = documentTemplates;
        $scope.isLoading = false;
      });
  };
  $scope.loadData();

  $scope.editDocumentTemplate = function(documentTemplate) {
    $location.path('/document-templates/' + documentTemplate._id + '/edit');
  };

  $scope.setDocumentTemplateStatus = function(documentTemplate, status) {
    $scope.isSaving = true;
    documentTemplate.status = status;
    documentTemplate
      .$update()
      .then(function() {
        Notifier.info('Document template updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.deleteDocumentTemplate = function(documentTemplate) {
    $scope.isSaving = true;
    documentTemplate
      .$delete()
      .then(function() {
        Notifier.info('Document template removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to remove document template');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
