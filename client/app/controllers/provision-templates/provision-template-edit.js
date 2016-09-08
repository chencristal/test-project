'use strict';

angular.module('app').controller('ProvisionTemplateEditCtrl',
  function($scope, $routeParams, $location, Notifier, ProvisionTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;

  (function loadData() {
    ProvisionTemplate
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(provisionTemplate) {
        $scope.provisionTemplate = provisionTemplate;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/provision-templates');
      });
  })();

  $scope.saveProvisionTemplate = function() {
    $scope.isSaving = true;
    $scope.provisionTemplate
      .$update()
      .then(function() {
        Notifier.info('ProvisionTemplate updated successfully');
        $location.path('/provision-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
