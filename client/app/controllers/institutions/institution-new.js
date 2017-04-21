'use strict';

angular.module('app').controller('InstitutionNewCtrl',
  function($scope, $location, Notifier, User, Institution, Identity) {

  $scope.institution = {};
  $scope.isSaving = false;
  $scope.institution.assigned = [];

  $scope.refreshAdmins = function(query) {
    $scope.admins = [];
    return User
      .query({ query: query, role: 'admin', institution: ['null'] })
      .$promise
      .then(function(admins) {
        $scope.admins = admins;
      });
  };

  $scope.refreshAuthors = function(query) {
    $scope.authors = [];
    return User
      .query({ query: query, role: 'author', institution: ['null'] })
      .$promise
      .then(function(authors) {
        $scope.authors = authors;
      });
  };

  $scope.refreshUsers = function(query) {
    $scope.users = [];
    return User
      .query({ query: query, role: 'user', institution: ['null'] })
      .$promise
      .then(function(users) {
        $scope.users = users;
      });
  };

  $scope.createInstitution = function() {
    $scope.isSaving = true;
    $scope.institution.assigned = _.concat(
      $scope.institution.assigned_admins,
      $scope.institution.assigned_authors,
      $scope.institution.assigned_users
    );

    var institution = new Institution($scope.institution);
    institution
      .$save()
      .then(function() {
        Notifier.info('New institution created successfully');
        $location.path('/institutions');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
