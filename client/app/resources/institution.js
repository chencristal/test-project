'use strict';

angular.module('app').factory('Institution', function($resource) {
  return $resource('/api/v1/institutions/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
