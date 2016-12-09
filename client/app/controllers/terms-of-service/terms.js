'use strict';

angular.module('app').controller('TermOfServiceCtrl',
  function ($scope, $location, $cookieStore) {
    $scope.terms = $cookieStore.get('terms');
    $scope.acceptTerms = function () {
      console.log('test');
      $cookieStore.put('terms', true);
      $location.path('/projects')
    };
  });