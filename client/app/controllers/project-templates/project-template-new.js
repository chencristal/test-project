'use strict';

angular.module('app').controller('ProjectTemplateNewCtrl',
  function($scope, $location, Notifier,
           ProjectTemplate, DocumentTemplate, User, UserGroup) {

  $scope.projectTemplate = new ProjectTemplate({
    style: 'normal'
  });
  $scope.isNew = true;
  $scope.isSaving = false;
  $scope.documentTemplates = [];
  $scope.users = [];
  $scope.userGroups = [];

  var _allUser = { _id: "0", firstName: "All Users" };

  $scope.refreshDocumentTemplates = function(query) {
    // if (!query) {
    //   return [];
    // }
    return DocumentTemplate
      .query({ query: query, status: 'active' })
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

  $scope.createProjectTemplate = function() {
    $scope.isSaving = true;
    $scope.projectTemplate
      .$save()
      .then(function() {
        Notifier.info('New projectTemplate created successfully');
        $location.path('/project-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
