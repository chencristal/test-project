'use strict';

angular.module('app').factory('Project', function($resource) {
  return $resource('/api/v1/projects/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
