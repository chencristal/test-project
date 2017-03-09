'use strict';

angular.module('app').factory('DocumentTemplate', function($resource) {
  return $resource('/api/v1/document-templates/:id',
	{ id: '@_id' },
	{
		update: {
			method: 'PUT'
		}
	});
});
