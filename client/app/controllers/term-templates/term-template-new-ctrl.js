'use strict';

angular.module('app').controller('TermTemplateNewCtrl',
  function($scope, $location, Notifier, TermTemplate) {

  $scope.termTemplate = {};
  $scope.isSaving = false;

  $scope.createTermTemplate = function() {
    $scope.isSaving = true;
    var termTemplate = new TermTemplate($scope.termTemplate);
    termTemplate
      .$save()
      .then(function() {
        Notifier.info('New termTemplate created successfully');
        $location.path('/term-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
