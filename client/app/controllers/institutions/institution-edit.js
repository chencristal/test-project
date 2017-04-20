'use strict';

angular.module('app').controller('InstitutionEditCtrl',
  function($scope, $routeParams, $location, Notifier, User, Institution/*, Identity*/) {

  $scope.isLoading = true;
  $scope.isSaving = false;

  (function loadData() {
    Institution
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(institution) {
        $scope.institution = institution;

        $scope.institution.assigned_admins = [];
        $scope.institution.assigned_authors = [];
        $scope.institution.assigned_users = [];

        _.forEach(institution.assigned, function(elem) {
          if (elem.role === 'admin') {
            $scope.institution.assigned_admins = _.concat($scope.institution.assigned_admins, elem);
          } else if (elem.role === 'author') {
            $scope.institution.assigned_authors = _.concat($scope.institution.assigned_authors, elem);
          } else if (elem.role === 'user') {
            $scope.institution.assigned_users = _.concat($scope.institution.assigned_users, elem);
          }
        });

        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/institutions');
      });
  })();

  $scope.refreshAdmins = function(query) {
    $scope.admins = [];
    return User
      .query({ query: query, role: 'admin', institution: [$routeParams._id, 'null'] })
      .$promise
      .then(function(admins) {
        $scope.admins = admins;
      });
  };

  $scope.refreshAuthors = function(query) {
    $scope.authors = [];
    return User
      .query({ query: query, role: 'author', institution: [$routeParams._id, 'null'] })
      .$promise
      .then(function(authors) {
        $scope.authors = authors;
      });
  };

  $scope.refreshUsers = function(query) {
    $scope.users = [];
    return User
      .query({ query: query, role: 'user', institution: [$routeParams._id, 'null'] })
      .$promise
      .then(function(users) {
        $scope.users = users;
      });
  };

  $scope.saveInstitution = function() {
    $scope.isSaving = true;
    $scope.institution.assigned = _.concat(
      $scope.institution.assigned_admins,
      $scope.institution.assigned_authors,
      $scope.institution.assigned_users
    );

    $scope.institution
      .$update()
      .then(function() {
        Notifier.info('Institution updated successfully');
        $location.path('/institutions');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
