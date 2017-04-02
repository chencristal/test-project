'use strict';

angular.module('app').controller('MainCtrl', function ($scope, $location, Identity, $cookieStore) {
  var path = $location.path();
  $scope.currentUser = Identity.getCurrentUser();

  if (path !== '/auth') {
    if (!Identity.isLoggedIn()) {
      $location.path('/login');
    }

    if (Identity.isLoggedIn() && !$cookieStore.get('terms') && Identity.isUser()) {
      $location.path('/terms');
    }
    
    if (Identity.isUser() && path === '/') {
      $location.path('/projects');
    }
  }
});
