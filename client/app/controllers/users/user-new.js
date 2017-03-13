'use strict';

angular.module('app').controller('UserNewCtrl',
  function($scope, $location, Notifier, User, Identity) {

  $scope.user = {};
  $scope.isSaving = false;

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };

  $scope.createUser = function() {
    $scope.isSaving = true;
    $scope.user.role = $scope.selectedRole.selected.value;

    var user = new User($scope.user);
    user
      .$save()
      .then(function() {
        Notifier.info('New user created successfully');
        $location.path('/users');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
