'use strict';

angular.module('app').controller('NavbarCtrl', function($scope, $location) {
  $scope.isActive = function(route) {
    var currentRoute = $location.path();
    return _.startsWith(currentRoute, route);
  };
});
