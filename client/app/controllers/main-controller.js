'use strict';

angular.module('app').controller('MainCtrl', function($scope, $location, Identity) {
  $scope.currentUser = Identity.getCurrentUser();

  if (!Identity.isLoggedIn()) {
    $location.path('/login');
  }
});
