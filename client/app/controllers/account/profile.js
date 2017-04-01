'use strict';

angular.module('app').controller('AccountProfileCtrl',
  function($scope, $location, Notifier, Profile, Identity, UserGroup) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.isNew = false;
  $scope.userGroups = [];
  
  (function loadData() {
    Profile
      .get()
      .$promise
      .then(function(user) {
        $scope.user = user;
        $scope.isLoading = false;
      });
  })();

  $scope.refreshUserGroups = function(query) {
    return UserGroup
      .query({ 
        query: query, 
        role: Identity.getRole(),
        prebuilt: false
      })
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
      });
  };

  $scope.roleName = function(role) {
    return Identity.getRoleTitle(role);
  };

  $scope.saveProfile = function() {
    $scope.isSaving = true;

    $scope.user
      .$update()
      .then(function(res) {
        Identity.setTokenAndUser(res);
        Identity.setCurrentUser(res.user);
        Notifier.info('Your profile updated successfully');
        $location.path('/users');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
