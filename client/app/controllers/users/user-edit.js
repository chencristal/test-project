'use strict';

angular.module('app').controller('UserEditCtrl',
  function($scope, $routeParams, $location, Notifier, User, UserGroup, Institution, Identity) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.isNew = false;
  $scope.userGroups = [];

  $scope.roles = Identity.getLowerRoleNames();
  $scope.selectedRole = { 'selected' : $scope.roles[0] };

  var origUserGroups = [];

  (function loadData() {
    User
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(user) {
        $scope.user = angular.copy(user);

        // User has only one institution currently
        $scope.user.institutions = (user.institutions[0] === undefined ? 'null' : user.institutions[0]);
        
        $scope.selectedRole.selected = Identity.getRoleName(user.role);
        origUserGroups = $scope.user.userGroups;
        
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/users');
      });
  })();

  $scope.updateRole = function() {
    if ($scope.user.role === $scope.selectedRole.selected.value) {
      $scope.user.userGroups = origUserGroups;
    } else {
      $scope.user.userGroups = [];
    }

    $scope.refreshUserGroups();
  };

  $scope.refreshUserGroups = function(query) {
    return UserGroup
      .query({ 
        query: query, 
        role: $scope.selectedRole.selected.value, 
        prebuilt: false
      })
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
      });
  };

  $scope.refreshInstitutions = function(query) {
    return Institution
      .query({ 
        query: query
      })
      .$promise
      .then(function(institutions) {
        $scope.institutions = _.concat({
          '_id' : 'null',
          'institutionName': 'Non-member'
        }, institutions);
      });
  };

  $scope.saveUser = function() {
    $scope.isSaving = true;
    $scope.user.role = $scope.selectedRole.selected.value;

    // Institution have to be _id param
    $scope.user.institutions = $scope.user.institutions._id;

    $scope.user
      .$update()
      .then(function() {
        Notifier.info('User updated successfully');
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
