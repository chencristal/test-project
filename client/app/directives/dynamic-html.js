'use strict';

angular.module('app')
.directive('dynamicHtml', function($compile, $timeout) {
  return {
    restrict: 'E',
    scope: {
      template: '=',
      variables: '=',
      textplus: '=',
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

.directive('ngVisible', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.ngVisible, function(newVal) {        
        if (newVal === true) {
          jQuery(element).show(500);
        }
        else if (newVal === false) {
          jQuery(element).hide(500);
        }
      });
    }
  }
})

.directive('ngOffset', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.ngOffset, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(scope.$eval(element.attr('ng-model')));

          offsetDate.setDate(offsetDate.getDate() + newVal);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = 0;
          var is_offset_variable = element.attr('ng-date-offset-variable');
          if (is_offset_variable == "true") {
            var offset_variable = element.attr('ng-offset');
            offset = scope.$eval(offset_variable);
          } else {
            offset = parseInt(element.attr('ng-offset'));
            if (isNaN(offset)) offset = 0;
          }
          offsetDate.setDate(offsetDate.getDate() + offset);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
})
.directive('ngOffsetMonth', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.ngOffsetMonth, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(scope.$eval(element.attr('ng-model')));

          offsetDate.setMonth(offsetDate.getMonth() + newVal);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = 0;
          var is_offset_variable = element.attr('ng-date-offset-variable');
          if (is_offset_variable == "true") {
            var offset_variable = element.attr('ng-offset-month');
            offset = scope.$eval(offset_variable);
          } else {
            offset = parseInt(element.attr('ng-offset-month'));
            if (isNaN(offset)) offset = 0;
          }
          offsetDate.setMonth(offsetDate.getMonth() + offset);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
})
.directive('ngOffsetYear', function($filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.ngOffsetYear, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(scope.$eval(element.attr('ng-model')));

          offsetDate.setFullYear(offsetDate.getFullYear() + newVal);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
      scope.$watch(attrs.ngModel, function(newVal, oldVal, scope){
        if (newVal !== undefined) {
          var offsetDate = new Date(newVal);
          var offset = 0;
          var is_offset_variable = element.attr('ng-date-offset-variable');
          if (is_offset_variable == "true") {
            var offset_variable = element.attr('ng-offset-year');
            offset = scope.$eval(offset_variable);
          } else {
            offset = parseInt(element.attr('ng-offset-year'));
            if (isNaN(offset)) offset = 0;
          }
          offsetDate.setFullYear(offsetDate.getFullYear() + offset);
          element.text($filter('date')(offsetDate, 'MMMM d, yyyy'));
        }
      });
    }
  };
});
