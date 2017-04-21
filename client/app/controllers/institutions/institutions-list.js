'use strict';

angular.module('app').controller('InstitutionsListCtrl',
  function($scope, $location, Notifier, Institution, Identity) {

  $scope.isLoading = true;

  (function loadData() {
    Institution
      .query()
      .$promise
      .then(function(institutions) {
        $scope.institutions = institutions;
        $scope.isLoading = false;
      });
  })();

  $scope.editInstitution = function(institution) {
    $location.path('/institutions/' + institution._id + '/edit');
  };

  $scope.setInstitutionStatus = function(institution, status) {
    $scope.isSaving = true;
    institution.status = status;
    institution
      .$update()
      .then(function() {
        Notifier.info('Institution updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
