'use strict';

angular.module('app').controller('TermTemplateNewCtrl',
  function($scope, $location, Notifier, TermTemplate) {

  $scope.termTemplate = {
    text: {},
    textarea: {
      style: 'auto'
    },
    boolean: {
      default: true,
      inclusionText: 'Include',
      exclusionText: 'Exclude'
    },
    variant: {
      options: [],
      displayAs: 'dropdown'
    },
    date: {
      default: new Date()
    }
  };
  $scope.isOpened = false;
  $scope.isNew = true;
  $scope.isSaving = false;
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.addOption = function() {
    $scope.termTemplate.variant.options.push({
      id: $scope.termTemplate.variant.options.length + 1,
      value: ''
    });
  };

  $scope.removeOption = function(option) {
    _.remove($scope.termTemplate.variant.options, option);
  };

  $scope.createTermTemplate = function() {
    $scope.isSaving = true;
    var termTemplate = new TermTemplate($scope.termTemplate);
    termTemplate
      .$save()
      .then(function() {
        Notifier.info('New termTemplate created successfully');
        $location.path('/term-templates');
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to save changes');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };
});
