'use strict';

angular.module('app').controller('ProvisionTemplatesListCtrl',
  function($scope, $location, Notifier, ProvisionTemplate) {

  $scope.isLoading = true;

  $scope.loadData = function() {
    ProvisionTemplate
      .query()
      .$promise
      .then(function(provisionTemplates) {
        $scope.provisionTemplates = provisionTemplates;
        $scope.isLoading = false;
      });
  };
  $scope.loadData();

  $scope.editProvisionTemplate = function(provisionTemplate) {
    $location.path('/provision-templates/' + provisionTemplate._id + '/edit');
  };

  $scope.setProvisionTemplateStatus = function(provisionTemplate, status) {
    $scope.isSaving = true;
    provisionTemplate.status = status;
    provisionTemplate
      .$update()
      .then(function() {
        Notifier.info('Provision template updated successfully');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save record');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.deleteProvisionTemplate = function(provisionTemplate) {
    $scope.isSaving = true;
    provisionTemplate
      .$delete()
      .then(function() {
        Notifier.info('Provision template removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to remove provision template');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
