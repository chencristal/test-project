'use strict';

angular.module('app').controller('InsertTableDialogCtrl', function($scope, $uibModalInstance) {
  $scope.newtable = { rows: 1, cols: 1 };

  $scope.ok = function() {
    $uibModalInstance.close($scope.newtable);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
});
