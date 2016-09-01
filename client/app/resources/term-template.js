'use strict';

angular.module('app').factory('TermTemplate', function($resource) {
  return $resource('/api/v1/term-templates/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
