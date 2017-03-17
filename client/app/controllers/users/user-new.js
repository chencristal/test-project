'use strict';

angular.module('app').controller('UserNewCtrl',
  function($scope, $location, Notifier, User, Identity, UserGroup) {

  $scope.user = {};
  $scope.isSaving = false;
  $scope.userGroups = [];

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };

  $scope.$watch('selectedRole.selected', function(newVal) {
    $scope.user.userGroups = [];
    $scope.refreshUserGroups();
  });

  $scope.refreshUserGroups = function(query) {
    return UserGroup
      .query({ query: query, role: $scope.selectedRole.selected.value })
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
      });
  };

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
