'use strict';

angular.module('app').factory('DocumentTemplateType', function($resource) {
  return $resource('/api/v1/document-template-types/:id', 
    { id: '@_id' },
    {
      update: {
        method: 'PUT'
      }
    });
});
