'use strict';

angular.module('app').directive('projectEditor', function () {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'views/projects/editor/index.html',
    controller: function ($scope, $window, $element, $timeout, $routeParams, $location, $q, Notifier,
                          Project, DocumentTemplate, ProvisionTemplate, TermTemplate, ProvisionVariable) {
      /* jshint maxstatements: false */

      $scope.isLoading = true;
      $scope.isSaving = false;
      $scope.mode = 'redline';
      $scope.linkedScreens = true;
      $scope.relatedData = {};
      $scope.variables = {};
      $scope.textplus = {};
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      $scope.variableStates = [
        {
          'name': 'Neutral',
          'background': '',
          'btn-class': 'btn-default',
          'span-class': ''
        },
        {
          'name': 'Confirmed',
          'background': 'bg-success',
          'btn-class': 'btn-success',
          'span-class': 'fa fa-check'
        },
        {
          'name': 'Uncertain',
          'background': 'bg-danger',
          'btn-class': 'btn-pink',
          'span-class': 'fa fa-question'
        }
      ];

      $scope.viewStates = [];
      $scope.defaultViewStates = [
        {
          'name': 'Hide confirmed state',
          'background': 'bg-success',
          'btn-class': 'btn-success',
          'span-class': 'fa fa-check',
          'type': 'Confirmed'
        },
        {
          'name': 'Hide uncertain state',
          'background': 'bg-danger',
          'btn-class': 'btn-pink',
          'span-class': 'fa fa-question',
          'type': 'Uncertain'
        },
        {
          'name': 'Hide neutral state',
          'background': '',
          'btn-class': 'btn-default',
          'span-class': '',
          'type': 'Neutral'
        }
      ];

      $scope.inverseViewStates = [
        {
          'name': 'Show confirmed state',
          'background': 'bg-success',
          'btn-class': 'btn-disabled',
          'span-class': 'fa fa-check',
          'type': 'Confirmed'
        },
        {
          'name': 'Show uncertain state',
          'background': 'bg-danger',
          'btn-class': 'btn-disabled',
          'span-class': 'fa fa-question',
          'type': 'Uncertain'
        },
        {
          'name': 'Show neutral state',
          'background': '',
          'btn-class': 'btn-disabled',
          'span-class': '',
          'type': 'Neutral'
        }
      ];
      
      $scope.filter = [{
          value: 100,
          flag: 7,
          label: 'All states'
        }, {
          value: 1,
          flag: 4,
          label: 'Confirmed states only'
        }, {
          value: 2,
          flag: 2,
          label: 'Uncertain states only'
        }, {
          value: 0,
          flag: 1,
          label: 'Neutrals only'
        }, {
          value: 3,
          flag: 3,
          label: 'Uncertain and Neutrals'
        }, {
          value: 4,
          flag: 6,
          label: 'Confirmed and Uncertain'
        }, {
          value: 5,
          flag: 5,
          label: 'Confirmed and Neutrals'
        }];
      $scope.filterVal = $scope.filter[0];

      $scope.history = []; // history for undo-redo
      $scope.currentPos = 0; // index of current position in history array

      $scope.changes = []; // array of prev/next changes
      $scope.currentChange = null; // index of current position in changes array

      $scope.viewStatus = {};
      

      angular.copy($scope.defaultViewStates, $scope.viewStates);

      $scope.changeViewState = function($event) {
        $event.stopPropagation();

        if (this.viewState.type == 'Confirmed') {

          if (this.viewState['btn-class'] == $scope.defaultViewStates[0]['btn-class']) {    // Hide the Confirmed
            var flag = $scope.filterVal.flag - 4;
            if (flag == 0) {
              jQuery('.div-view-state').effect('shake');
              return;
            }

            angular.copy($scope.inverseViewStates[0], $scope.viewStates[0]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
          else {      // Show the Confirmed
            var flag = $scope.filterVal.flag + 4;
            
            if (flag == 7)
              angular.copy($scope.defaultViewStates, $scope.viewStates);
            else
              angular.copy($scope.defaultViewStates[0], $scope.viewStates[0]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
        }
        else if (this.viewState.type == 'Uncertain') {

          if (this.viewState['btn-class'] == $scope.defaultViewStates[1]['btn-class']) {    // Hide the Uncertain
            var flag = $scope.filterVal.flag - 2;
            if (flag == 0) {
              jQuery('.div-view-state').effect('shake');
              return;
            }

            angular.copy($scope.inverseViewStates[1], $scope.viewStates[1]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
          else {      // Show the Uncertain
            var flag = $scope.filterVal.flag + 2;
            
            if (flag == 7)
              angular.copy($scope.defaultViewStates, $scope.viewStates);
            else
              angular.copy($scope.defaultViewStates[1], $scope.viewStates[1]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
        }
        else if (this.viewState['type'] == 'Neutral') {

          if (this.viewState['btn-class'] == $scope.defaultViewStates[2]['btn-class']) {    // Hide the Neutrals
            var flag = $scope.filterVal.flag - 1;
            if (flag == 0) {
              jQuery('.div-view-state').effect('shake');
              return;
            }

            angular.copy($scope.inverseViewStates[2], $scope.viewStates[2]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
          else {      // Show the Neutrals
            var flag = $scope.filterVal.flag + 1;
            
            if (flag == 7)
              angular.copy($scope.defaultViewStates, $scope.viewStates);
            else
              angular.copy($scope.defaultViewStates[2], $scope.viewStates[2]);
            $scope.filterVal = _.find($scope.filter, { 'flag': flag});
          }
        }
      }

      $scope.$watch('relatedData.currrentDocumentTemplate', function (newDocTempl) {
        if (newDocTempl) {          
          _loadRelatedData(newDocTempl);
        }

        setTimeout(function () {
          $scope.changes = document.getElementsByClassName('selected highlighted');
          if ($scope.changes.length) {
            $scope.currentChange = -1;
          } else {
            $scope.changes = document.getElementsByClassName('unselected highlighted');
            $scope.currentChange = -1;
          }
          autosize($('textarea[scrollmode="auto"]'));
          $('textarea').on('keydown', function(e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9) {
              e.preventDefault();
              var start = $(this).get(0).selectionStart;
              var end = $(this).get(0).selectionEnd;

              // set textarea value to: text before caret + tab + text after caret
              $(this).val($(this).val().substring(0, start)
                          + "\t"
                          + $(this).val().substring(end));

              // put caret at right position again
              $(this).get(0).selectionStart =
              $(this).get(0).selectionEnd = start + 1;
            }
          });
          $('span.unselected input').addClass('exp-disabled');
        }, 300);

        $scope.history = []; // reset history
      });

      $scope.highlight = function (variable, fromEditor, currentTarget) {
        for (var i = 0; i < $scope.changes.length; i++) {
          $($scope.changes[i]).removeClass('highlighted-navigation');
          // $scope.changes[i].style.backgroundColor = null;
        }
        
        $('input.exp-disabled').removeClass('exp-disabled');
        $('span.unselected input').addClass('exp-disabled');
        
        var className = variable.termType == 'boolean' ? '#editor .highlighted' : '.highlighted-for-scroll';

        fromEditor = typeof fromEditor !== 'undefined' ? fromEditor : false;
  	    currentTarget = typeof currentTarget !== 'undefined' ? currentTarget : false;
  	    $scope.selectedVariable = variable;
        $scope.changes = $(className);

        setTimeout(function () {
          $scope.currentChange = -1;
          if(variable.termType == 'boolean') {
            $scope.changes = $('#editor .highlighted');
          }
          else
            $scope.changes = $('.highlighted-for-scroll');

        }, 50)

        if ($scope.linkedScreens) {
          setTimeout(function () {
            var containerEdit = document.getElementById('innerEditor');
            var elementProp = $('#properties .highlighted')[0];
            
            var containerProp = document.getElementById('properties');

            if(variable.termType == 'boolean') {
              var elementEditor = $('#editor .highlighted');
            }
            else
              var elementEditor = $('.highlighted-for-scroll');

            if (elementEditor.length) {
              if (!fromEditor) {
	              var elementPropRect = elementProp.getBoundingClientRect().top;
	              var containerEditRect = containerEdit.getBoundingClientRect().top;
	              var diff = elementPropRect - containerEditRect;
                var scrollOffsetTop = elementEditor[0].offsetTop - diff - 80;
	              smooth_scroll_to(containerEdit, scrollOffsetTop, 600);
              } else {
	              var elementEditorRect = currentTarget.getBoundingClientRect().top;
	              var containerPropRect = containerProp.getBoundingClientRect().top;
	              var diff = elementEditorRect - containerPropRect;
	              var scrollOffsetTop = elementProp.offsetTop - diff - 70;
		            smooth_scroll_to(containerProp, scrollOffsetTop, 600);
              }
            }

          }, 50);
        }
        
        
      };

      $scope.save = function (historyTransition) {
        historyTransition = typeof historyTransition !== 'undefined' ? historyTransition : false;
        $scope.isSaving = true;

        var newProjValues = [];
        _.each($scope.variables, function (v) {
          var variable = _.pick(v, ['variable', 'value', 'state', 'placeholder']);
          var projVal = _.find($scope.project.values, {variable: variable.variable});
          if (projVal) {
            projVal.value = variable.value;
            projVal.state = variable.state;
            projVal.placeholder = variable.placeholder;
            newProjValues.push(projVal);
          } else {
            // $scope.project.values.push(variable);
            newProjValues.push(variable);
          }
        });
        $scope.project.values = newProjValues;

        var projectForSave = new Project($scope.project);
        projectForSave.projectTemplate = projectForSave.projectTemplate._id;

        projectForSave
          .$update()
          .catch(function (err) {
            Notifier.error(err, 'Unable to save project');
          })
          .finally(function () {
            $scope.isSaving = false;

            // chen_debug
            $q
            .resolve()
            .then(function () {
              return _loadProvisionVariables($scope.relatedData.currrentDocumentTemplate);   // chen_debug
            })
            .then(function () {
              _.each($scope.variables, function (variable) {
                if(variable.termType == 'textplus_sub') {
                  var master = variable.variable.split('__')[0];
                  $scope.viewStatus[variable.variable] = $scope.viewStatus[master];
                }
                /*else {
                  $scope.viewStatus[variable.variable] = 
                    (_.find($scope.viewedVars, {'variable': variable.variable}) !== undefined) ? true : false;
                }*/
              });
            })
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
          if ($scope.currentPos + 1 !== $scope.history.length) {
            // after current index delete array's all next elements (elements of redo after save new value).
            $scope.history.splice($scope.currentPos + 1, $scope.history.length);
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
          $scope.currentChange = $scope.changes.length - 1;
        }

        for (var i = 0; i < $scope.changes.length; i++) {
          $scope.changes[i].style.backgroundColor = null;
        }

        var container = document.getElementById('#innerEditor');
        var element = $scope.changes[$scope.currentChange];
        if(!$(element).is(':visible')) {
          $scope.prevChange();
          return;
        }
        var hiddenParents = $(element).parentsUntil('#editor').filter(function() {return $(this).css('display') == 'none';}).first();
        if(hiddenParents.length > 0) {
          $scope.prevChange();
          return;
        }
        $('.highlighted-navigation').removeClass('highlighted-navigation');
        $(element).addClass('highlighted-navigation');

        var elementProp = $('#properties .highlighted')[0];
        var elementPropRect = elementProp.getBoundingClientRect().top;
        var containerEditRect = container.getBoundingClientRect().top;
        var diff = elementPropRect - containerEditRect;
        var scrollOffsetTop = element.offsetTop - diff - 80;
        smooth_scroll_to(container, scrollOffsetTop, 600);

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

        for (var i = 0; i < $scope.changes.length; i++) {
          $scope.changes[i].style.backgroundColor = null;
        }

        var container = document.getElementById('innerEditor');
        var element = $scope.changes[$scope.currentChange];
        if(!$(element).is(':visible')) {
          $scope.nextChange();
          return;
        }
        var hiddenParents = $(element).parentsUntil('#editor').filter(function() {return $(this).css('display') == 'none';}).first();
        if(hiddenParents.length > 0) {
          $scope.nextChange();
          return;
        }

        $('.highlighted-navigation').removeClass('highlighted-navigation');
        $(element).addClass('highlighted-navigation');

        var elementProp = $('#properties .highlighted')[0];
        var elementPropRect = elementProp.getBoundingClientRect().top;
        var containerEditRect = container.getBoundingClientRect().top;
        var diff = elementPropRect - containerEditRect;
        var scrollOffsetTop = element.offsetTop - diff - 80;
        smooth_scroll_to(container, scrollOffsetTop, 600);
      }

      $scope.getSubFields = function (variable) {
        var master = _.find($scope.variables, {'variable': variable});
        var subs = _.filter($scope.variables, function(v) { return v.variable.indexOf(variable + '__') === 0;});
        if(!subs || subs.length == 0)
          subs = [master];
        subs = _.orderBy(subs, ['sortIndex'],['asc']);
        return subs;
      }
      $scope.addSubField = function (variable, $event) {
        var subs = $scope.getSubFields(variable.variable);
        var temp = subs[0].variable.split('__');
        
        var order = temp.length > 1 ? parseInt(temp[1]) + 1 : 1;
        var sub = angular.copy($scope.variables[variable.variable]);
        sub.sortIndex = sub.sortIndex + parseFloat(1/(1+order));
        sub.variable = sub.variable + '__' + order;
        sub.termType = 'textplus_sub';
        sub.value = '';
        sub.displayName = '';
        sub.state = 0;
        $scope.variables[sub.variable] = sub;
        $scope.textplus[variable.variable].push(sub);
        $scope.viewStatus[sub.variable] = $scope.viewStatus[variable.variable];
      }
      $scope.removeSubField = function (variable, $event) {
        delete $scope.variables[variable.variable];
        var master = variable.variable.split('__')[0];
        _.remove($scope.textplus[master], {variable: variable.variable});
      }

      $scope.changeState = function ($event) {
        var index = this.variable.state ? this.variable.state : 0;
        if (index == $scope.variableStates.length - 1) {
          index = 0;
        } else {
          index += 1;
        }
        this.variable.state = index;
        var termTypes = ['text', 'date', 'number', 'textplus', 'textplus_sub'];       //for placeholder actions
        var termTypesRe = ['text', 'textplus', 'textplus_sub'];                       //for actual value actions
        if(this.variable.value == undefined)
          this.variable.value = '';
        if(termTypes.indexOf(this.variable.termType) > -1 && this.variable.value.trim() == '') {
          var termType = this.variable.termType;
          if(this.variable.state == 1 || this.variable.state == 2) {    //Confirmed, Uncertain State
            var placeholder = '';
            if(termType.indexOf('textplus') > -1)
              placeholder = this.variable['textplus'].placeholder;
            else
              placeholder = this.variable[termType].placeholder;
            if(/^\[.*\]$/.test(placeholder)) {
              this.variable.placeholder = placeholder.substr(1, placeholder.length-2);    //Strip off brackets on both sides
            }
          }
          else {                            //Neutral State
            this.variable.placeholder = this.variable.placeholder_original;
          }
        }
        else if(termTypesRe.indexOf(this.variable.termType) > -1 && this.variable.value.trim() != '') {
          if(this.variable.state == 1 || this.variable.state == 2) {    //Confirmed, Uncertain State
            var value = this.variable.value;
            if(/^\[.*\]$/.test(value)) {
              this.variable.value = value.substr(1, value.length-2);            //Strip off brackets on both sides and leave it unchanged when Neutral
            }
          }
        }
        $scope.save();
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

      angular.element($window).bind('resize', _setEditorHeight);

      $element.on('$destroy', function () {
        angular.element($window).unbind('resize');
      });

      $scope.setMode = function (mode) {
        $scope.mode = mode;
      };

      $scope.exportToPdf = function () {
        var projId = $scope.project._id;
        var docId = $scope.relatedData.currrentDocumentTemplate._id;
        var url = '/api/v1/projects/' + projId + '/' + docId + '/pdf';
        $window.open(url, '_blank');
      };

      $scope.exportToWord = function () {
        var projId = $scope.project._id;
        var docId = $scope.relatedData.currrentDocumentTemplate._id;
        var docTypeId = $scope.relatedData.currrentDocumentTemplate.documentType;
        var url = '/api/v1/projects/' + projId + '/' + docId + '/' + docTypeId + '/word';
        $window.open(url, '_blank');
      };

      function _parseTokenWithValues(token, values) {   // chen_debug
        var _variables = [];

        function _parseBoolean(text) {
          var _temp = _.find(values, {'variable': text});

          if (_temp !== undefined) {
            if (_temp.value == 'true' || _temp.value == true) {
              return true;
            }
          }

          return false;
        }
        function _parseIfCond(token) {
          var v1 = _parseBoolean(token.params[0].text),
              op = token.params[1].text,
              v2 = _parseBoolean(token.params[2].text);

          switch (op) {
            case 'and':
              return (v1 && v2);
            case 'not-and':
              return (!v1 && v2);
            case 'and-not':
              return (v1 && !v2);
            case 'not-and-not':
              return (!v1 && !v2);
            case 'or':
              return (v1 || v2);
            case 'not-or':
              return (!v1 || v2);
            case 'or-not':
              return (v1 || !v2);
            case 'not-or-not':
              return (!v1 || !v2);
            default:
              return false;
          }
        }

        function _parseIfVariant(token) {
          var text = token.params[0].text,
              op = token.params[1].text;

          var _temp = _.find(values, {'variable': text});

          return (_temp !== undefined && _temp.value == op);
        }

        function _parseValues(token) {
          if (!token) {
            return '';
          }

          if (token.type === undefined) {     // chen_debug (if the token is array)
            _.map(token, _parseValues);
          }
          else {
            switch (token.type) {
              case 'program':
                _.map(token.tokens, _parseValues);
                break;
              case 'variable': {
                var _temp = _.find(values, {'variable': token.text});
                if (_.find(_variables, _temp) == undefined) {
                  _variables = _.concat(_variables, _temp);
                }
                break;
              }
              case 'statement': {
                if (token.text == 'if') {
                  var _temp = _.find(values, {'variable': token.params[0].text});
                  if (_.find(_variables, _temp) == undefined)
                    _variables = _.concat(_variables, _temp);

                  if (_parseBoolean(token.params[0].text) == true) {
                    _.map(token.tokens,  _parseValues);
                  }
                }
                else if (token.text == 'unless') {
                  var _temp = _.find(values, {'variable': token.params[0].text});
                  if (_.find(_variables, _temp) == undefined)
                    _variables = _.concat(_variables, _temp);

                  if (_parseBoolean(token.params[0].text) == false) {
                    _.map(token.tokens,  _parseValues);
                  }
                }
                else if (token.text == 'math') {
                  _.forEach(token.params, function(param) {
                    if (param.type == 'variable') {
                      var _temp = _.find(values, {'variable': param.text});
                      if (_.find(_variables, _temp) == undefined) {
                        _variables = _.concat(_variables, _temp);
                      }
                    }
                  });
                }
                else if (token.text == 'ifVariant') {
                  _.forEach(token.params, function(param) {
                    if (param.type == 'variable') {
                      var _temp = _.find(values, {'variable': param.text});
                      if (_.find(_variables, _temp) == undefined) {
                        _variables = _.concat(_variables, _temp);
                      }
                    }
                  });

                  if (_parseIfVariant(token) == true) {
                    _.map(token.tokens, _parseValues);
                  }
                }
                else if (token.text == 'unlessVariant') {
                  _.forEach(token.params, function(param) {
                    if (param.type == 'variable') {
                      var _temp = _.find(values, {'variable': param.text});
                      if (_.find(_variables, _temp) == undefined) {
                        _variables = _.concat(_variables, _temp);
                      }
                    }
                  });

                  if (_parseIfVariant(token) == false) {
                    _.map(token.tokens, _parseValues);
                  }
                }
                else if (token.text == 'ifCond') {
                  _.forEach(token.params, function(param) {
                    if (param.type == 'variable') {
                      var _temp = _.find(values, {'variable': param.text});
                      if (_.find(_variables, _temp) == undefined) {
                        _variables = _.concat(_variables, _temp);
                      }
                    }
                  });

                  if (_parseIfCond(token) == true) {
                    _.map(token.tokens, _parseValues);
                  }
                }
                break;
              }
            } // END of switch
          }
          
        }

        _parseValues(token);

        var retVar = {};
        _.forEach($scope.variables, function(variable) {
          retVar[variable.variable] = 
            (_.find(_variables, {'variable': variable.variable}) == undefined) ? false : true;
        });

        // return retVar;
        $scope.viewStatus = angular.copy(retVar);
        _.each($scope.variables, function (variable) {
          if(variable.termType == 'textplus_sub') {
            var master = variable.variable.split('__')[0];
            $scope.viewStatus[variable.variable] = $scope.viewStatus[master];
          }
        });
      }

      function _loadData() {
        Project
          .get({
            id: $routeParams._id
          })
          .$promise
          .then(function (proj) {
            $scope.project = proj;
            return _loadDocumentTemplates(proj);
          })
          .catch(function (err) {
            Notifier.error(err, 'Unable to load record');
            $location.path('/projects');
          })
          .finally(function () {
            $scope.isLoading = false;
          });
      }

      function _loadRelatedData(newDocTempl) {
        $scope.isLoading = true;
        $q
          .resolve()
          .then(function () {
            return _loadProvisionTemplates(newDocTempl);
          })
          .then(_loadTermTemplates)
          .catch(function (err) {
            Notifier.error(err, 'Unable to load records');
          })
          .then(function () {
            // append loaded data to history array
            $scope.vars = angular.copy($scope.variables);
            $scope.history.push($scope.vars);

            _loadProvisionVariables(newDocTempl);   // chen_debug
          })
          .finally(function () {
            $scope.isLoading = false;
          });
      }

      function _loadDocumentTemplates(proj) {
        return DocumentTemplate
          .query({
            'includes[]': proj.projectTemplate.documentTemplates,
            'fields[]': ['name', 'documentType', 'provisionTemplates']
          })
          .$promise
          .then(function (docTempls) {
            $scope.relatedData.currrentDocumentTemplate = docTempls[0];
            $scope.relatedData.documentTemplates = docTempls;
          });
      }

      function _loadProvisionVariables(docTempl) {    // chen_debug
        return ProvisionVariable
          .get({
            id: docTempl.provisionTemplates[0]
          })
          .$promise
          .then(function(viewedToken) {            
            $scope.isLoading = false;
            return _parseTokenWithValues(viewedToken, $scope.variables);
          })
          .catch(function(err) {
            Notifier.error(err, 'Unable to load record');
          });
      }

      function _loadProvisionTemplates(docTempl) {
        return ProvisionTemplate
          .query({
            'includes[]': docTempl.provisionTemplates,
            'fields[]': ['displayName', 'style', 'termTemplates', 'templateHtml', 'orderedVariables']
          })
          .$promise
          .then(function (provTempls) {
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
          .then(function (termTempls) {
            $scope.variables = {};
            _.each(termTempls, function (termTempl) {
              var val = _.find($scope.project.values, {variable: termTempl.variable});
              if (val) {
                if (termTempl.termType === 'boolean') {
                  termTempl.value = val.value === 'true' || val.value === true;
                } else if (termTempl.termType === 'date') {
                  termTempl.value = val.value ? new Date(val.value) : '';
                } else if (termTempl.termType === 'number') {
                    termTempl.value = val.value ? parseFloat(val.value) : '';
                } else {
                  termTempl.value = val.value;
                }
                termTempl.placeholder_original = termTempl[termTempl.termType].placeholder;
                termTempl.placeholder = val['placeholder'];
                if(!termTempl.placeholder)
                  termTempl.placeholder = termTempl.placeholder_original;
              } else {
                if (termTempl.termType === 'boolean') {
                  termTempl.value = termTempl.boolean.default;
                } else if (termTempl.termType === 'variant') {
                  termTempl.value = termTempl.variant.default;
                } else if (termTempl.termType === 'date') {
                  termTempl.value = '';
                } else if (termTempl.termType === 'number') {
                  termTempl.value = '';
                }
                termTempl.placeholder_original = termTempl[termTempl.termType].placeholder;
                termTempl.placeholder = termTempl[termTempl.termType].placeholder;
              }
              termTempl.state = val ? val['state'] : 0;             
              termTempl.sortIndex = _.indexOf($scope.relatedData.orderedVariables, termTempl.variable);
              $scope.variables[termTempl.variable] = termTempl;

              /*$scope.viewStatus[termTempl.variable] = 
                (_.find($scope.viewedVars, {'variable': termTempl.variable}) !== undefined) ? true : false;*/
            });
            _.each($scope.variables, function(v) {
              if(v.termType == 'textplus') {
                var subs = _.filter($scope.project.values, function(sub) { return sub.variable.indexOf(v.variable + '__') === 0; });
                $scope.textplus[v.variable] = [];
                _.each(subs, function(sub) {
                  var newVar = angular.copy(v);
                  newVar.variable = sub.variable;
                  newVar.termType = 'textplus_sub';
                  newVar.displayName = '';
                  var temp = newVar.variable.split('__');        
                  var order = parseInt(temp[1]);
                  newVar.sortIndex = v.sortIndex + parseFloat(1/(1+order));
                  newVar.state = sub.state;
                  newVar.value = sub.value;
                  $scope.variables[newVar.variable] = newVar;
                  $scope.textplus[v.variable].push(newVar);
                });
              }
            });
          });
      }

      function _setEditorHeight() {
        $timeout(function () {
          $scope.editorHeight = angular.element($window).innerHeight() - 115;
          $scope.$apply();
        });
      }

      var smooth_scroll_to = function (element, target, duration) {
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
        var smooth_step = function (start, end, point) {
          if (point <= start) {
            return 0;
          }
          if (point >= end) {
            return 1;
          }
          var x = (point - start) / (end - start); // interpolation
          return x * x * (3 - 2 * x);
        }

        return new Promise(function (resolve, reject) {
          // This is to keep track of where the element's scrollTop is
          // supposed to be, based on what we're doing
          var previous_top = element.scrollTop;

          // This is like a think function from a game loop
          var scroll_frame = function () {
            if (element.scrollTop != previous_top) {
              reject("interrupted");
              return;
            }

            // set the scrollTop for this frame
            var now = Date.now();
            var point = smooth_step(start_time, end_time, now);
            var frameTop = Math.round(start_top + (distance * point));
            element.scrollTop = frameTop;

            // check if we're done!
            if (now >= end_time) {
              resolve();
              return;
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done; not
            // interrupted.
            if (element.scrollTop === previous_top
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
