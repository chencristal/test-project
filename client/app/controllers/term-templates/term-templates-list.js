'use strict';

angular.module('app').controller('TermTemplatesListCtrl',
  function($scope, $uibModal, $location, Notifier, TermTemplate) {

  $scope.isLoading = true;

  (function loadData() {
    TermTemplate
      .query({
        'fields[]': ['termType', 'variable', 'displayName']
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

  // TODO: unused?
  $scope.deleteTermTemplate = function(termTemplate) {
    $scope.isSaving = true;
    $uibModal.open({
      templateUrl: 'views/common/confirmation-dialog.html',
      controller: 'ModalCtrl',
      resolve: {
        items: function() {
          return {
            title: 'Delete ' + termTemplate.name + '?',
            message: termTemplate.name + ' will be permanently deleted.'
          };
        }
      }
    })
    .result
    .then(function() {
      return termTemplate.$remove({ id: termTemplate._id });
    })
    .then(function() {
      _.remove($scope.termTemplates, termTemplate);
      Notifier.info('TermTemplate deleted successfully');
    })
    .catch(function(err) {
      if (err !== 'cancel') {
        Notifier.error(err, 'Unable to delete termTemplate');
      }
    })
    .finally(function() {
      $scope.isSaving = false;
    });
  };
});
