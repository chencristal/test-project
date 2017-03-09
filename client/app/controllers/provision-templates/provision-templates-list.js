'use strict';

angular.module('app').controller('ProvisionTemplatesListCtrl',
  function($scope, $location, Notifier, ProvisionTemplate) {

  $scope.isLoading = true;

  (function loadData() {
    ProvisionTemplate
      .query()
      .$promise
      .then(function(provisionTemplates) {
        $scope.provisionTemplates = provisionTemplates;
        $scope.isLoading = false;
      });
  })();

  $scope.editProvisionTemplate = function(provisionTemplate) {
    $location.path('/provision-templates/' + provisionTemplate._id + '/edit');
  };
});
