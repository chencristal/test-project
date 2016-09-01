'use strict';

angular.module('app').controller('TermTemplateDetailsCtrl',
  function($scope, $location, $routeParams, TermTemplate, Notifier) {

  $scope.isLoading = true;

  TermTemplate
    .get({ id : $routeParams._id })
    .$promise
    .then(function(termTemplate) {
      $scope.termTemplate = termTemplate;
      $scope.isLoading = false;
    })
    .catch(function(err) {
      Notifier.error(err, 'Unable to load record');
      $location.path('/term-templates');
    });
});
