'use strict';

angular.module('app').controller('ProjectProcessorCtrl',
  function($scope, $routeParams, $location, $sce, Notifier, Project, DocumentTemplate, ProvisionTemplate) {

  $scope.isLoading = true;
  $scope.isSaving = false;
  $scope.mode = 'edit';
  $scope.relatedData = {};

  (function loadData() {
    Project
      .get({
        id: $routeParams._id
      })
      .$promise
      .then(function(proj) {
        $scope.project = proj;
        return DocumentTemplate
          .query({
            'includes[]': proj.projectTemplate.documentTemplates,
            'fields[]': ['name', 'provisionTemplates'] 
          })
          .$promise;
      })
      .then(function(docTempls) {
        $scope.relatedData.currrentDocumentTemplate = docTempls[0];
        $scope.relatedData.documentTemplates = docTempls;
        $scope.isLoading = false;
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to load record');
        $location.path('/projects');
      });
  })();

  $scope.trustAsHtml = function(value) {
    return $sce.trustAsHtml(value);
  };

  $scope.setMode = function(mode) {
    $scope.mode = mode;
  };

  $scope.$watch('relatedData.currrentDocumentTemplate', function(newDocTempl) {
    if (newDocTempl) {
      $scope.isLoading = true;
      ProvisionTemplate
        .query({
          'includes[]': newDocTempl.provisionTemplates,
          'fields[]': ['displayName', 'style', 'template']
        })
        .$promise
        .then(function(provTempls) {
          $scope.relatedData.provisionTemplates = provTempls;
        })
        .catch(function(err) {
          Notifier.error(err, 'Unable to load records');
        })
        .finally(function() {
          $scope.isLoading = false;
        });
    }
  });
});
