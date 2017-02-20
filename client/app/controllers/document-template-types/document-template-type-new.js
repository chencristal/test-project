'use strict';

angular.module('app').controller('DocumentTemplateTypeNewCtrl',
  function($scope, $location, Notifier, DocumentTemplateType) {

  $scope.documentTemplateType = {
    style: 'normal',
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
  $scope.grabJSON = function(files) {
    console.log(files);
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
      }
      $scope.documentTemplateType.styles = data;
      $scope.$apply();
    }
    f.onerror = function(e) {
      $scope.documentTemplateType.styles = '';
      $scope.$apply();
      Notifier.error(e);
    }
    f.readAsText(file);
  };
});

angular.module('app').directive('onFileChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.onFileChange);
      element.bind('change', event => {
        var files = event.target.files;
        onChangeHandler(files);
      });
      element.bind('click', () => element.val(''));
    }
  }
});