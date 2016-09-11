'use strict';

angular.module('app').factory('ProjectTemplate', function($resource) {
  return $resource('/api/v1/project-templates/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
