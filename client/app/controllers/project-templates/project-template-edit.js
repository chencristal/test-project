'use strict';

angular.module('app').controller('ProjectTemplateEditCtrl',
  function($scope, $routeParams, $location, Notifier,
           ProjectTemplate, DocumentTemplate, User, UserGroup) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.documentTemplates = [];
  $scope.users = [];
  $scope.userGroups = [];

  var _allUser = { _id: "0", firstName: "All Users" };

  (function loadData() {
    ProjectTemplate
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(projTempl) {
        $scope.projectTemplate = projTempl;
        return DocumentTemplate.query({ 'includes[]': projTempl.documentTemplates });
      })
      .then(function(docTempls) {
        $scope.documentTemplates = docTempls;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/project-templates');
      });
  })();

  $scope.refreshDocumentTemplates = function(query) {
    if (!query) {
      return [];
    }
    return DocumentTemplate
      .query({ query: query })
      .$promise
      .then(function(docTempls) {
        $scope.documentTemplates = docTempls;
      });
  };

  $scope.refreshUserGroups = function(query) {
    return UserGroup
      .query({ query: query, role: 'user'})
      .$promise
      .then(function(usergroups) {
        $scope.userGroups = usergroups;
      });
  };

  $scope.refreshUsers = function(query) {
    return User
      .query({ query: query, role: 'user' })
      .$promise
      .then(function(users) {

        // For 'All Users' item
        users = _.concat(_allUser, users);
        if ($scope.projectTemplate.allUsers) {
          $scope.projectTemplate.users = [ _allUser._id ];
        }
        $scope.users = users;
      });
  };

  $scope.onSelectUser = function(item, model) {
    if (model === _allUser._id) {
      $scope.projectTemplate.users = [ _allUser._id ];
    }
    else {
      _.pull($scope.projectTemplate.users, _allUser._id);
    }
  };

  $scope.saveProjectTemplate = function() {
    $scope.isSaving = true;
    $scope.projectTemplate
      .$update()
      .then(function() {
        Notifier.info('ProjectTemplate updated successfully');
        $location.path('/project-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
