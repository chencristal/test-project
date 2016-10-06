'use strict';

angular.module('app').directive('dynamicHtml', function($compile, $timeout) {
  return {
    restrict: 'E',
    scope: {
      template: '=',
      variables: '='
    },
    link: function($scope, $element) {
      $timeout(function() {
        $scope.$apply(function() {
          var content = $compile($scope.template)($scope);
          $element.append(content);
        });
      });
    }
  };
});
