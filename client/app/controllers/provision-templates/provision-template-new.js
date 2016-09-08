'use strict';

angular.module('app').controller('ProvisionTemplateNewCtrl',
  function($scope, $location, Notifier, ProvisionTemplate) {

  $scope.provisionTemplate = {
    style: 'normal'
  };
  $scope.isNew = true;
  $scope.isSaving = false;

  $scope.createProvisionTemplate = function() {
    $scope.isSaving = true;
    var provisionTemplate = new ProvisionTemplate($scope.provisionTemplate);
    provisionTemplate
      .$save()
      .then(function() {
        Notifier.info('New provisionTemplate created successfully');
        $location.path('/provision-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
