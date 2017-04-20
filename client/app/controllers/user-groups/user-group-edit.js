'use strict';

angular.module('app').controller('UserGroupEditCtrl',
  function($scope, $routeParams, $location, Notifier, User, UserGroup, Identity) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.users = [];

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };
  $scope.selectedUsers = { 'selected' : [] };

  var origUserGroup = {};

  (function loadData() {
    UserGroup
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(usergroup) {
        $scope.userGroup = usergroup;
        $scope.selectedRole.selected = Identity.getRoleName(usergroup.role);
        origUserGroup = angular.copy($scope.userGroup);

        $scope.userGroup.assigned = [];
        _.forEach(origUserGroup.assigned, function(elem) {
          $scope.userGroup.assigned = _.concat($scope.userGroup.assigned, elem._id);
        });

        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/user-groups');
      });
  })();

  $scope.updateRole = function() {
    $scope.userGroup.assigned = [];
    if ($scope.userGroup.role === $scope.selectedRole.selected.value) {
      _.forEach(origUserGroup.assigned, function(elem) {
        $scope.userGroup.assigned = _.concat($scope.userGroup.assigned, elem._id);
      });
    }
      
    $scope.refreshUsers();
  };

  $scope.refreshUsers = function(query) {
    return User
      .query({ query: query, role: $scope.selectedRole.selected.value })
      .$promise
      .then(function(users) {
        $scope.users = users;
      });
  };

  $scope.saveUserGroup = function() {
    $scope.isSaving = true;
    $scope.userGroup.role = $scope.selectedRole.selected.value;

    $scope.userGroup
      .$update()
      .then(function() {
        Notifier.info('User group updated successfully');
        $location.path('/user-groups');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
