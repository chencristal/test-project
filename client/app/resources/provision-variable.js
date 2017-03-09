'use strict';

angular.module('app').factory('ProvisionVariable', function($resource) {
  return $resource('/api/v1/provision-variables/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
