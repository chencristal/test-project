'use strict';

angular.module('app').controller('DocumentTemplateTypeNewCtrl',
  function($scope, $location, Notifier, DocumentTemplateType) {

  $scope.documentTemplateType = {
    style: 'normal'
  };
  $scope.isNew = true;
  $scope.isSaving = false;

  $scope.createDocumentTemplateType = function() {
    $scope.isSaving = true;
    var documentTemplateType = new DocumentTemplateType($scope.documentTemplateType);
    documentTemplateType
      .$save()
      .then(function() {
        Notifier.info('New documentTemplateType created successfully');
        $location.path('/document-template-types');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
