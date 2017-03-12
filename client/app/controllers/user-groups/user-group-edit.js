'use strict';

angular.module('app').controller('UserGroupEditCtrl',
  function($scope, $routeParams, $location, Notifier, UserGroup, Identity) {

  $scope.isLoading = true;
  $scope.isSaving = false;

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };

  (function loadData() {
    UserGroup
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(usergroup) {
        $scope.userGroup = usergroup;
        $scope.selectedRole.selected = Identity.getRoleName(usergroup.role);

        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/user-groups');
      });
  })();

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
