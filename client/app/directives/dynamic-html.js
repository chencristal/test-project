'use strict';

angular.module('app').directive('dynamicHtml', function($compile, $timeout) {
  return {
    restrict: 'E',
    scope: {
      template: '=',
      variables: '=',
      selectedVariable: '=',
      onChange: '&'
    },
    link: function($scope, $element) {
      $scope.datePickers = {};
      
      $scope.onClick = function (variable) {
	      $scope.$parent.$parent.highlight(variable, true); // accessing to projectEditor method. Second argument tells for highlighting from editor, but not from properties left-side block.
      }
        
      $timeout(function() {
        $scope.$apply(function() {
          var content = $compile($scope.template)($scope);
          $element.append(content);
        });
      });
    }
  };
});
