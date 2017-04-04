'use strict';

angular.module('app').controller('TermTemplatesListCtrl',
  function($scope, $window, $http, $timeout, $uibModal, $location, Notifier, TermTemplate) {

  $scope.isLoading = true;

  $scope.loadData = function() {
    TermTemplate
      .query({
        'fields[]': ['termType', 'variable', 'displayName', 'disabled']
      })
      .$promise
      .then(function(termTemplates) {
        $scope.termTemplates = termTemplates;
        $scope.isLoading = false;
        $scope.orderBy = 'termType';
        $scope.reverseSort = false;
      });
  };
  $scope.loadData();

  $scope.editTermTemplate = function(termTemplate) {
    $location.path('/term-templates/' + termTemplate._id + '/edit');
  };

  $scope.updateTermTemplateState = function(termTemplate, isDisabled) {
    $scope.isSaving = true;
    var fn = isDisabled ? TermTemplate.disable : TermTemplate.enable;
    fn({ _id: termTemplate._id })
      .$promise
      .then(function() {
        termTemplate.disabled = isDisabled;
        Notifier.info('TermTemplate state updated successfully');
      })
      .catch(function(err) {
        if (err !== 'cancel') {
          Notifier.error(err, 'Unable to update termTemplate state');
        }
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.deleteTermTemplate = function(termTemplate) {
    $scope.isSaving = true;
    termTemplate
      .$delete()
      .then(function() {
        Notifier.info('Term template removed successfully');
        $scope.loadData();
      })
      .catch(function(err) {
        Notifier.error(err, 'Unable to remove term template');
      })
      .finally(function() {
        $scope.isSaving = false;
      });
  };

  $scope.uploadCSV = function() {
    function isValid(file) {
      var filename = file.name;
      var ext = filename.split('.').pop();
      return ext == 'csv';
    }
    function hasDuplicates(data) {
      var records = data.split(/\n/);
      var termVars = [];
      for(var i = 0; i < $scope.termTemplates.length; i ++) {
        var elem = $scope.termTemplates[i];
        if(elem.variable)
          termVars.push(elem.variable);
      }
      
      for(var i = 0; i < records.length; i ++) {
        var record = records[i].split(',');
        var varname = record[1];  //Variable name
        if(termVars.indexOf(varname) > -1) {
          Notifier.error(new Error('Duplicate entry found: ' + varname) );
          return false;
        }
        termVars.push(varname);
      }
      return data;
    }
    function upload(data) {
      if(data == false) return;
      data = data.split(/\r|\n/);
      for(var i = 0; i < data.length; i ++) {
        if(data[i] == '') {
          data.splice(i,1);
          i--;
        }
      }
      $http.post('/api/v1/term-templates/import', data)
      .then(function success(res) {
        Notifier.success(res.data);
        $timeout(() => $location.path('/term-templates/'), 1000);
      }, function error(res) {
          Notifier.error(new Error(res.data));
      });
    }

    var file = $('#csvfile')[0].files[0];
    $('#csvfile')[0].value = '';
    if(!isValid(file)) {
      Notifier.error(new Error('Invalid file type'));
      return false;
    }
    var promise = new Promise(function(resolve, reject) {
      var f = new FileReader();
      f.onload = function() {
        var data = f.result;
        resolve(data);
      }
      f.onerror = function(e) {
        reject(e);
      }
      f.readAsText(file);
    });
    promise
      .then(hasDuplicates, e => Notifier.error(e))
      .then(upload);
    
  };
  $scope.exportToCSV = function() {
    var randomID = (new Date()).valueOf()
    var url = `/api/v1/term-templates/${randomID}/export`;
    $window.open(url, '_blank');
  };
});
