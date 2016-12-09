'use strict';

angular.module('app').controller('MainCtrl', function ($scope, $location, Identity, $cookieStore) {
  $scope.currentUser = Identity.getCurrentUser();

  if (!Identity.isLoggedIn()) {
    $location.path('/login');
  }

  if (!$cookieStore.get('terms')) {
    $location.path('/terms');
  }
  if (Identity.isUser() && $location.path() === '/') {
    $location.path('/projects');
  }
});
