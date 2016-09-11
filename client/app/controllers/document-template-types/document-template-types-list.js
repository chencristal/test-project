'use strict';

angular.module('app').controller('DocumentTemplateTypesListCtrl',
  function($scope, $uibModal, $location, Notifier, DocumentTemplateType) {

  $scope.isLoading = true;

  (function loadData() {
    DocumentTemplateType
      .query()
      .$promise
      .then(function(documentTemplateTypes) {
        $scope.documentTemplateTypes = documentTemplateTypes;
        $scope.isLoading = false;
      });
  })();

  $scope.editDocumentTemplateType = function(documentTemplateType) {
    $location.path('/document-template-types/' + documentTemplateType._id + '/edit');
  };
});
