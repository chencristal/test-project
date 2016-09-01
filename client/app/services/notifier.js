'use strict';

angular.module('app').value('Toastr', toastr);

angular.module('app').factory('Notifier', function(Toastr) {
  return {
    success: function(msg) {
      Toastr.success(msg);
    },
    error: function(msg) {
      Toastr.error(msg);
    },
    info: function(msg) {
      Toastr.info(msg);
    },
    warning: function(msg) {
      Toastr.warning(msg);
    }
  };
});
