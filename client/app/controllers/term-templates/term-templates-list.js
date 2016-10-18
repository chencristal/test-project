'use strict';

angular.module('app').controller('TermTemplatesListCtrl',
  function($scope, $uibModal, $location, Notifier, TermTemplate) {

  $scope.isLoading = true;

  (function loadData() {
    TermTemplate
      .query({
        'fields[]': ['termType', 'variable', 'displayName', 'disabled']
      })
      .$promise
      .then(function(termTemplates) {
        $scope.termTemplates = termTemplates;
        $scope.isLoading = false;
      });
  })();

  $scope.editTermTemplate = function(termTemplate) {
    $location.path('/term-templates/' + termTemplate._id + '/edit');
  };

  $scope.updateTermTemplateState = function(termTemplate, isDisabled) {
    $scope.isSaving = true;
    var fn = isDisabled ? TermTemplate.disable : TermTemplate.enable;
    fn({ _id: termTemplate._id })
      .$promise
      .then(function() {
        termTemplate.disabled = isDisabled;
        Notifier.info('TermTemplate state updated successfully');
      })
      .catch(function(err) {
        if (err !== 'cancel') {
          Notifier.error(err, 'Unable to update termTemplate state');
        }
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
