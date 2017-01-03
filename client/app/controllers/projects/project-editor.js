'use strict';

angular.module('app').directive('projectEditor', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'views/projects/editor/index.html',
    controller: function($scope, $window, $element, $timeout, $routeParams, $location, $q, Notifier,
                         Project, DocumentTemplate, ProvisionTemplate, TermTemplate) {
      /* jshint maxstatements: false */

      $scope.isLoading = true;
      $scope.isSaving = false;
      $scope.mode = 'redline';
      $scope.linkedScreens = true;
      $scope.relatedData = {};
      $scope.variables = {};
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      
      $scope.history = []; // history for undo-redo
      $scope.currentPos = 0; // index of current position in history array
        
      $scope.changes = []; // array of prev/next changes
      $scope.currentChange = null; // index of current position in changes array

      angular.element($window).bind('resize', _setEditorHeight);

      $element.on('$destroy', function() {
        angular.element($window).unbind('resize');
      });

      $scope.$watch('relatedData.currrentDocumentTemplate', function(newDocTempl) {
        if (newDocTempl) {
          _loadRelatedData(newDocTempl);
        }
	
	    $scope.changes = document.getElementsByClassName('selected');
        $scope.history = []; // reset history
      });

      $scope.setMode = function(mode) {
        $scope.mode = mode;
      };

      $scope.highlight = function(variable, fromEditor) {
      	fromEditor = typeof fromEditor !== 'undefined' ? fromEditor : false;
        $scope.selectedVariable = variable;
	    $scope.changes = document.getElementsByClassName('selected');
	
	    if ($scope.linkedScreens) {
		    setTimeout(function () {
			    var containerEdit = document.getElementById('editor');
			    var elementProp = document.getElementsByClassName('highlighted')[0];
			    var elementEditor = document.getElementsByClassName('selected highlighted');
			
			    if (!elementEditor.length) {
				    elementEditor = document.getElementsByClassName('highlighted-for-scroll');
			    }
			    
			    if (!fromEditor)
				    smooth_scroll_to(containerEdit, elementEditor[0].offsetTop-elementProp.offsetTop, 600);
			    
		    }, 50);
	    }
	    // reset styling
	    for(var i = 0; i < $scope.changes.length; i++) {
		    $scope.changes[i].style.backgroundColor = null;
	    }
      };

      $scope.exportToPdf = function() {
        var projId = $scope.project._id;
        var docId = $scope.relatedData.currrentDocumentTemplate._id;
        var url = '/api/v1/projects/' + projId + '/' + docId + '/pdf';
        $window.open(url, '_blank');
      };

      $scope.exportToWord = function() {
        var projId = $scope.project._id;
        var docId = $scope.relatedData.currrentDocumentTemplate._id;
        var url = '/api/v1/projects/' + projId + '/' + docId + '/word';
        $window.open(url, '_blank');
      };

      $scope.save = function(historyTransition) {
	    historyTransition = typeof historyTransition !== 'undefined' ?  historyTransition : false;
	    $scope.isSaving = true;
	    
	    _.each($scope.variables, function(v) {
          var variable = _.pick(v, ['variable', 'value']);
          var projVal = _.find($scope.project.values, { variable: variable.variable });
          if (projVal) {
            projVal.value = variable.value;
          } else {
            $scope.project.values.push(variable);
          }
        });

        var projectForSave = new Project($scope.project);
        projectForSave.projectTemplate = projectForSave.projectTemplate._id;

        projectForSave
          .$update()
          .catch(function(err) {
            Notifier.error(err, 'Unable to save project');
          })
          .finally(function() {
            $scope.isSaving = false;
          });
        
	    // copy to another variable cause of angular scope specification.
	    $scope.vars = angular.copy($scope.variables);
  
        /*
           if save() method called after history transition (undo()/redo() methods)
           and has entering parameter  as bool value "true" - skip
           pushing new value to array, just change current position index.
        */
	    if (!historyTransition) {
	      // if current history element not last element in history array
	      if ($scope.currentPos+1 !== $scope.history.length) {
		      // after current index delete array's all next elements (elements of redo after save new value).
		      $scope.history.splice($scope.currentPos+1, $scope.history.length);
	      }
		  $scope.history.push($scope.vars);
		  $scope.currentPos = $scope.history.length - 1;
        }
        
      };
	
	  $scope.prevChange = function () {
	  	if ($scope.currentChange === null) {
	  		$scope.currentChange = 0;
	    } else {
		    $scope.currentChange -= 1;
	    }
	    
		if ($scope.currentChange === -1) {
			$scope.currentChange = $scope.changes.length-1;
		}
		
		for (var i=0; i<$scope.changes.length; i++) {
			$scope.changes[i].style.backgroundColor = null;
		}
		
		var container = document.getElementById('editor');
		var element = $scope.changes[$scope.currentChange];
		
		element.style.backgroundColor = '#FFEB3B';
		
		smooth_scroll_to(container, element.offsetTop-80, 600); // -80 makes some top padding
		
	  }
	
	  $scope.nextChange = function () {
		if ($scope.currentChange === null) {
		  $scope.currentChange = 0;
		} else {
		  $scope.currentChange += 1;
		}
		  
		if ($scope.currentChange === $scope.changes.length) {
			$scope.currentChange = 0;
		}
		
		for (var i=0; i<$scope.changes.length; i++) {
		  $scope.changes[i].style.backgroundColor = null;
		}
	    
		var container = document.getElementById('editor');
		var element = $scope.changes[$scope.currentChange];
		
		element.style.backgroundColor = '#FFEB3B';
		
		smooth_scroll_to(container, element.offsetTop-80, 600); // -80 makes some top padding
		  
	  }
      
      $scope.undo = function () {
	    $scope.currentPos -= 1;
	    
	    $scope.vars = angular.copy($scope.history[$scope.currentPos]);
        $scope.variables = $scope.vars;
          
        $scope.save(true);
      }
	
	  $scope.redo = function () {
		$scope.currentPos += 1;
		
		$scope.vars = angular.copy($scope.history[$scope.currentPos]);
		$scope.variables = $scope.vars;
		
		$scope.save(true);
	  }

      function _loadData() {
        Project
          .get({
            id: $routeParams._id
          })
          .$promise
          .then(function(proj) {
            $scope.project = proj;
            return _loadDocumentTemplates(proj);
          })
          .catch(function(err) {
            Notifier.error(err, 'Unable to load record');
            $location.path('/projects');
          })
          .finally(function() {
            $scope.isLoading = false;
          });
        
      }

      function _loadRelatedData(newDocTempl) {
        $scope.isLoading = true;
        $q
          .resolve()
          .then(function() {
            return _loadProvisionTemplates(newDocTempl);
          })
          .then(_loadTermTemplates)
          .catch(function(err) {
            Notifier.error(err, 'Unable to load records');
          })
          .then(function () {
	          // append loaded data to history array
	          $scope.vars = angular.copy($scope.variables);
	          $scope.history.push($scope.vars);
          })
          .finally(function() {
            $scope.isLoading = false;
          });
      }

      function _loadDocumentTemplates(proj) {
        return DocumentTemplate
          .query({
            'includes[]': proj.projectTemplate.documentTemplates,
            'fields[]': ['name', 'provisionTemplates']
          })
          .$promise
          .then(function(docTempls) {
            $scope.relatedData.currrentDocumentTemplate = docTempls[0];
            $scope.relatedData.documentTemplates = docTempls;
          });
      }

      function _loadProvisionTemplates(docTempl) {
        return ProvisionTemplate
          .query({
            'includes[]': docTempl.provisionTemplates,
            'fields[]': ['displayName', 'style', 'termTemplates', 'templateHtml', 'orderedVariables']
          })
          .$promise
          .then(function(provTempls) {
            $scope.relatedData.provisionTemplates = provTempls;
            $scope.relatedData.orderedVariables = _(provTempls)
              .map('orderedVariables')
              .flatten()
              .uniq()
              .value();
          });
      }

      function _loadTermTemplates() {
        var termTemplateIds = _($scope.relatedData.provisionTemplates)
          .map('termTemplates')
          .flattenDeep()
          .uniq()
          .value();
        if (termTemplateIds.length === 0) {
          $scope.variables = {};
          return;
        }
        return TermTemplate
          .query({
            'includes[]': termTemplateIds,
            'fields[]': ['*']
          })
          .$promise
          .then(function(termTempls) {
            $scope.variables = {};
            _.each(termTempls, function(termTempl) {
              var val = _.find($scope.project.values, { variable: termTempl.variable });
              if (val) {
                if (termTempl.termType === 'boolean') {
                  termTempl.value = val.value === 'true' || val.value === true;
                } else if (termTempl.termType === 'date') {
                  termTempl.value = new Date(val.value);
                } else {
                  termTempl.value = val.value;
                }
              } else if (termTempl.termType === 'boolean') {
                termTempl.value = termTempl.boolean.default;
              } else if (termTempl.termType === 'variant') {
                termTempl.value = termTempl.variant.default;
              } else if (termTempl.termType === 'date') {
                termTempl.value = termTempl.date ? new Date(termTempl.date.default) : new Date();
              }
              termTempl.sortIndex = _.indexOf($scope.relatedData.orderedVariables, termTempl.variable);
              $scope.variables[termTempl.variable] = termTempl;
            });
          });
      }

      function _setEditorHeight() {
        $timeout(function() {
          $scope.editorHeight = angular.element($window).innerHeight() - 115;
          $scope.$apply();
        });
      }
	
	  var smooth_scroll_to = function(element, target, duration) {
	    target = Math.round(target);
	    duration = Math.round(duration);
	    if (duration < 0) {
		    return Promise.reject("bad duration");
	    }
	    if (duration === 0) {
		    element.scrollTop = target;
		    return Promise.resolve();
	    }
	
	    var start_time = Date.now();
	    var end_time = start_time + duration;
	
	    var start_top = element.scrollTop;
	    var distance = target - start_top;
	
	    // based on http://en.wikipedia.org/wiki/Smoothstep
	    var smooth_step = function(start, end, point) {
		    if(point <= start) { return 0; }
		    if(point >= end) { return 1; }
		    var x = (point - start) / (end - start); // interpolation
		    return x*x*(3 - 2*x);
		}
		
		return new Promise(function(resolve, reject) {
		    // This is to keep track of where the element's scrollTop is
		    // supposed to be, based on what we're doing
		    var previous_top = element.scrollTop;
			
		    // This is like a think function from a game loop
		    var scroll_frame = function() {
			    if(element.scrollTop != previous_top) {
				    reject("interrupted");
				    return;
			    }
				
			    // set the scrollTop for this frame
			    var now = Date.now();
			    var point = smooth_step(start_time, end_time, now);
			    var frameTop = Math.round(start_top + (distance * point));
			    element.scrollTop = frameTop;
				
			    // check if we're done!
			    if(now >= end_time) {
				    resolve();
				    return;
			    }
				
			    // If we were supposed to scroll but didn't, then we
			    // probably hit the limit, so consider it done; not
			    // interrupted.
			    if(element.scrollTop === previous_top
				    && element.scrollTop !== frameTop) {
				    resolve();
				    return;
			    }
			    previous_top = element.scrollTop;
			
			    // schedule next frame for execution
			    setTimeout(scroll_frame, 0);
		    }
			
		    // boostrap the animation process
		    setTimeout(scroll_frame, 0);
		});
	  }

      _loadData();
      _setEditorHeight();
    }
  };
});
