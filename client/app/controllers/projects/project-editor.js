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
      $scope.mode = 'redline';
      $scope.relatedData = {};
      $scope.variables = {};

      angular.element($window).bind('resize', _setEditorHeight);

      $element.on('$destroy', function() {
        angular.element($window).unbind('resize');
      });

      $scope.$watch('relatedData.currrentDocumentTemplate', function(newDocTempl) {
        if (newDocTempl) {
          _loadRelatedData(newDocTempl);
        }
      });

      $scope.setMode = function(mode) {
        $scope.mode = mode;
      };

      $scope.showHelp = function(termTempl) {
        $scope.selectedTermTempl = termTempl;
      };

      $scope.save = function() {
        $scope.isSaving = true;
        var projectForSave = new Project($scope.project);
        projectForSave.projectTemplate = projectForSave.projectTemplate._id;
        projectForSave.values = _.map($scope.relatedData.termTemplates, function(tt) {
          return _.pick(tt, ['variable', 'value']);
        });

        projectForSave
          .$update()
          .then(function() {
            Notifier.info('The record is updated successfully');
          })
          .catch(function(err) {
            Notifier.error(err, 'Unable to save record');
          })
          .finally(function() {
            $scope.isSaving = false;
          });
      };

      function _loadData() {
        Project
          .get({
            id: $routeParams._id
          })
          .$promise
          .then(function(proj) {
            $scope.project = proj;
            return _loadDocumentTemplates(proj);
          })
          .catch(function(err) {
            Notifier.error(err, 'Unable to load record');
            $location.path('/projects');
          })
          .finally(function() {
            $scope.isLoading = false;
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

      function _loadDocumentTemplates(proj) {
        return DocumentTemplate
          .query({
            'includes[]': proj.projectTemplate.documentTemplates,
            'fields[]': ['name', 'provisionTemplates'] 
          })
          .$promise
          .then(function(docTempls) {
            $scope.relatedData.currrentDocumentTemplate = docTempls[0];
            $scope.relatedData.documentTemplates = docTempls;
          });
      }

      function _loadProvisionTemplates(docTempl) {
        return ProvisionTemplate
          .query({
            'includes[]': docTempl.provisionTemplates,
            'fields[]': ['displayName', 'style', 'termTemplates', 'templateHtml']
          })
          .$promise
          .then(function(provTempls) {
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
            _.each(termTempls, function(termTempl) {
              var val = _.find($scope.project.values, { variable: termTempl.variable });
              if (val) {
                if (termTempl.termType !== 'boolean') {
                  termTempl.value = val.value;
                } else {
                  termTempl.value = val.value === 'true';
                }
              } else if (termTempl.termType === 'boolean') {
                termTempl.value = termTempl.boolean.default;
              }
              $scope.variables[termTempl.variable] = termTempl;
            });
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
