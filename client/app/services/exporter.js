'use strict';

angular.module('app').factory('Exporter', function($http) {
  return {
    exportToPdf: function(docTemplId, values) {
      return $http
        .put('/api/v1/document-templates/' + docTemplId + '/export-to-pdf', {
          values: values
        })
        .then(function(data) {
          var anchor = angular.element('<a/>');
          anchor.attr({
            href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
            target: '_blank',
            download: 'example.pdf'
          })[0].click();
        });
    }
  };
});
