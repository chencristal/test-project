'use strict';

angular.module('app').controller('DocumentTemplateTypeEditCtrl',
  function($scope, $routeParams, $location, Notifier, DocumentTemplateType) {

  $scope.isLoading = true;
  $scope.isSaving = false;

  (function loadData() {
    DocumentTemplateType
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(documentTemplateType) {
        $scope.documentTemplateType = documentTemplateType;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/document-template-types');
      });
  })();

  $scope.saveDocumentTemplateType = function() {
    $scope.isSaving = true;
    $scope.documentTemplateType
      .$update()
      .then(function() {
        Notifier.info('DocumentTemplateType updated successfully');
        $location.path('/document-template-types');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
