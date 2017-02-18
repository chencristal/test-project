'use strict';

angular.module('app')
.directive('dynamicHtml', function($compile, $timeout) {
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
      
      $scope.onClick = function (variable, $event) {
        var currentTarget = $event.currentTarget;

        // accessing to projectEditor method.
        // Second argument tells for highlighting from editor, 
        // but not from properties left-side block.
	      $scope.$parent.$parent.highlight(variable, true, currentTarget);
      }
        
      $timeout(function() {
        $scope.$apply(function() {
          var content = $compile($scope.template)($scope);
          $element.append(content);
        });
      });
    }
  };
})

.directive('ngOffset', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {      
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = parseInt(element.attr('ng-offset'));
          if (isNaN(offset)) offset = 0;
          offsetDate.setDate(offsetDate.getDate() + offset);
          element.val($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
})
.directive('ngOffsetMonth', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {      
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = parseInt(element.attr('ng-offset-month'));
          if (isNaN(offset)) offset = 0;
          offsetDate.setMonth(offsetDate.getMonth() + offset);
          element.val($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
})
.directive('ngOffsetYear', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {      
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = parseInt(element.attr('ng-offset-year'));
          if (isNaN(offset)) offset = 0;
          offsetDate.setFullYear(offsetDate.getFullYear() + offset);
          element.val($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
});
