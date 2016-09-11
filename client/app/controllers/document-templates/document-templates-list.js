'use strict';

angular.module('app').controller('DocumentTemplatesListCtrl',
  function($scope, $uibModal, $location, Notifier, DocumentTemplate) {

  $scope.isLoading = true;

  (function loadData() {
    DocumentTemplate
      .query()
      .$promise
      .then(function(documentTemplates) {
        $scope.documentTemplates = documentTemplates;
        $scope.isLoading = false;
      });
  })();

  $scope.editDocumentTemplate = function(documentTemplate) {
    $location.path('/document-templates/' + documentTemplate._id + '/edit');
  };
});
