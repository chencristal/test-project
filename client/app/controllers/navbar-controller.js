'use strict';

angular.module('app').controller('NavbarCtrl', function($scope, $location) {
  $scope.isActive = function(route, startsWith) {
    return route === $location.path() || (startsWith && _.startsWith($location.path(), route));
  };
});
