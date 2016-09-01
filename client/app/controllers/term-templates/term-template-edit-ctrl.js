'use strict';

angular.module('app').controller('TermTemplateEditCtrl',
  function($scope, $routeParams, $location, Notifier, TermTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;

  (function loadData() {
    TermTemplate
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(termTemplate) {
        $scope.termTemplate = termTemplate;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/term-templates');
      });
  })();

  $scope.saveTermTemplate = function() {
    $scope.isSaving = true;
    $scope.termTemplate
      .$update()
      .then(function() {
        Notifier.info('TermTemplate updated successfully');
        $location.path('/term-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
