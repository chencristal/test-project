'use strict';

angular.module('app').controller('UserGroupNewCtrl',
  function($scope, $location, Notifier, User, UserGroup, Identity) {

  $scope.userGroup = {};
  $scope.isSaving = false;
  $scope.users = [];

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };

  $scope.updateRole = function() {
    $scope.refreshUsers();
  };

  $scope.refreshUsers = function(query) {
    return User
      .query({ query: query, role: $scope.selectedRole.selected.value })
      .$promise
      .then(function(users) {
        $scope.users = users;
        $scope.userGroup.assigned = [];
      });
  };

  $scope.createUserGroup = function() {
    $scope.isSaving = true;
    $scope.userGroup.role = $scope.selectedRole.selected.value;

    var userGroup = new UserGroup($scope.userGroup);
    userGroup
      .$save()
      .then(function() {
        Notifier.info('New user group created successfully');
        $location.path('/user-groups');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
