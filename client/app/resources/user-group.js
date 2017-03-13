'use strict';

angular.module('app').factory('UserGroup', function($resource) {
  return $resource('/api/v1/user-groups/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
