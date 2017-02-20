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
  $scope.grabJSON = function(files) {
    function isValid(file) {
      var filename = file.name;
      var ext = filename.split('.').pop().toLowerCase();
      return ext == 'json';
    }
    var file = files[0];
    if(!isValid(file)) {
      Notifier.error(new Error('Invalid file type'));
      $scope.documentTemplateType.styles = '';
      $scope.$apply();
      return;
    }
    var f = new FileReader();
    f.onload = function() {
      var data = f.result;
      try{
        JSON.parse(data);
      } catch(e) {
        Notifier.error('Error parsing JSON data');
        $scope.documentTemplateType.styles = '';
        $scope.$apply();
        return;
      }
      $scope.documentTemplateType.styles = data;
      $scope.$apply();
    }
    f.onerror = function(e) {
      $scope.documentTemplateType.styles = '';
      $scope.$apply();
      Notifier.error(e);
      return;
    }
    f.readAsText(file);
  };
});