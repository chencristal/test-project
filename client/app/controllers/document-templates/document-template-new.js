'use strict';

angular.module('app').controller('DocumentTemplateNewCtrl',
  function($scope, $location, Notifier, DocumentTemplate) {

  $scope.documentTemplate = {
    style: 'normal'
  };
  $scope.isNew = true;
  $scope.isSaving = false;

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
