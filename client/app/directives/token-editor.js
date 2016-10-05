'use strict';

angular.module('app').directive('tokenEditor', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/projects/editor/token-editor.html',
    scope: {
      token: '='
    }
  };
});
