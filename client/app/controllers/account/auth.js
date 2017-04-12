'use strict';

angular.module('app').controller('AccountAuthCtrl',
  function($scope, $location, $window, Notifier, Auth) {

  $scope.user = {};

  (function loadData() {
    var authinfo = $location.search();

    $scope.isRequesting = true;
    Auth
      .urlLogin({
        email: authinfo.user,
        password: authinfo.pass
      })
      .then(function () {
        $location.url($location.path());
        $location.path('/');
      })
      .catch(function(err) {
        Notifier.warning(err);
      })
      .finally(function() {
        $scope.isRequesting = false;
      });
  })();
});
