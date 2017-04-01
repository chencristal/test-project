'use strict';

angular.module('app').controller('UserGroupsListCtrl',
  function($scope, $location, Notifier, UserGroup, Identity) {

  $scope.isLoading = true;

  (function loadData() {
    UserGroup
      .query({prebuilt: false})
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
        $scope.isLoading = false;
      });
  })();

  $scope.roleName = function(role) {
    return Identity.getRoleTitle(role);
  };

  $scope.editUserGroup = function(usergroup) {
    $location.path('/user-groups/' + usergroup._id + '/edit');
  };

  $scope.setUserGroupStatus = function(usergroup, status) {
    $scope.isSaving = true;
    usergroup.status = status;
    usergroup
      .$update()
      .then(function() {
        Notifier.info('User Group updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
