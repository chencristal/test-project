'use strict';

angular.module('app').controller('TermTemplateEditCtrl',
  function($scope, $routeParams, $location, Notifier, TermTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.isOpened = false;
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  (function loadData() {
    TermTemplate
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(termTemplate) {
        $scope.termTemplate = termTemplate;
        $scope.termTemplate.date.default = new Date($scope.termTemplate.date.default);
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/term-templates');
      });
  })();

  $scope.addOption = function() {
    $scope.termTemplate.variant.options.push({
      id: $scope.termTemplate.variant.options.length + 1,
      value: ''
    });
  };

  $scope.removeOption = function(option) {
    _.remove($scope.termTemplate.variant.options, option);
  };

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
