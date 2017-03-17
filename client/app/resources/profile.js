'use strict';

angular.module('app').factory('Profile', function($resource) {
  return $resource('/api/v1/profile', 
    { },
    {
      update: {
        method: 'PUT'
      }
    });
});
