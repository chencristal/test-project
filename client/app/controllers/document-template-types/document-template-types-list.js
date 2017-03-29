'use strict';

angular.module('app').controller('DocumentTemplateTypesListCtrl',
  function($scope, $location, Notifier, DocumentTemplateType) {

  $scope.isLoading = true;

  $scope.loadData = function() {
    DocumentTemplateType
      .query()
      .$promise
      .then(function(documentTemplateTypes) {
        $scope.documentTemplateTypes = documentTemplateTypes;
        $scope.isLoading = false;
      });
  };
  $scope.loadData();

  $scope.editDocumentTemplateType = function(documentTemplateType) {
    $location.path('/document-template-types/' + documentTemplateType._id + '/edit');
  };

  $scope.setDocumentTemplateTypeStatus = function(documentTemplateType, status) {
    $scope.isSaving = true;
    documentTemplateType.status = status;
    documentTemplateType
      .$update()
      .then(function() {
        Notifier.info('Document template type updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.deleteDocumentTemplateType = function(documentTemplateType) {
    $scope.isSaving = true;
    documentTemplateType
      .$delete()
      .then(function() {
        Notifier.info('Document template type removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to remove document template type');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
