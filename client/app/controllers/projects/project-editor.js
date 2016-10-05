'use strict';

angular.module('app').directive('projectEditor', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'views/projects/editor/index.html',
    controller: function($scope, $window, $element, $timeout, $routeParams, $location, $q, Notifier,
                         Project, DocumentTemplate, ProvisionTemplate, TermTemplate) {

      $scope.isLoading = true;
      $scope.isSaving = false;
      $scope.mode = 'edit';
      $scope.relatedData = {};

      // TODO: remove later
      $scope.token = {
        text: 'SuperText',
        value: 123
      };

      angular.element($window).bind('resize', _setEditorHeight);

      $element.on('$destroy', function() {
        angular.element($window).unbind('resize');
      });

      $scope.setMode = function(mode) {
        $scope.mode = mode;
      };

      $scope.$watch('relatedData.currrentDocumentTemplate', function(newDocTempl) {
        if (newDocTempl) {
          _loadRelatedData(newDocTempl);
        }
      });

      function _loadData() {
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
      }

      function _loadRelatedData(newDocTempl) {
        $scope.isLoading = true;
        $q
          .resolve()
          .then(function() {
            return _loadProvisionTemplates(newDocTempl);
          })
          .then(_loadTermTemplates)
          .catch(function(err) {
            Notifier.error(err, 'Unable to load records');
          })
          .finally(function() {
            $scope.isLoading = false;
          });
      }

      function _loadProvisionTemplates(newDocTempl) {
        return ProvisionTemplate
          .query({
            'includes[]': newDocTempl.provisionTemplates,
            'fields[]': ['displayName', 'style', 'template', 'termTemplates', 'templateHtml', 'tokensRoot']
            // TODO: template, tokensRoot
          })
          .$promise
          .then(function(provTempls) {
            _.each(provTempls, function(pt) {
              if (pt.tokensRoot) {
                pt.tokensRoot = JSON.parse(pt.tokensRoot);
              }
            });
            $scope.relatedData.provisionTemplates = provTempls;
          });
      }

      function _loadTermTemplates() {
        var termTemplateIds = _($scope.relatedData.provisionTemplates)
          .map('termTemplates')
          .flattenDeep()
          .uniq()
          .value();
        if (termTemplateIds.length === 0) {
          $scope.relatedData.termTemplates = [];
          return;
        }
        return TermTemplate
          .query({
            'includes[]': termTemplateIds,
            'fields[]': ['*']
          })
          .$promise
          .then(function(termTempls) {
            $scope.relatedData.termTemplates = termTempls;
          });
      }

      function _setEditorHeight() {
        $timeout(function() {
          $scope.editorHeight = angular.element($window).innerHeight() - 115;
          $scope.$apply();
        });
      }

      _loadData();
      _setEditorHeight();
    }
  };
});
