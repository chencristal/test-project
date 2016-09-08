'use strict';

angular.module('app').factory('ProvisionTemplate', function($resource) {
  return $resource('/api/v1/provision-templates/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
