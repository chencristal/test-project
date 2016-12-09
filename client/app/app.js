'use strict';

angular.module('app', [
  'ngResource',
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  'ui.select',
  'textAngular',
  'mwl.confirm'
])
.config(function($routeProvider, $locationProvider, $httpProvider) {
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('HttpInterceptor');

  $routeProvider
    .when('/not-found', {
      templateUrl: 'views/not-found.html',
    })
    .when('/', {
      templateUrl: 'views/home.html',
    })

    .when('/login', {
      templateUrl: 'views/account/login.html',
      controller: 'AccountLoginCtrl'
    })
    .when('/forget-password', {
      templateUrl: 'views/account/forget-password.html',
      controller: 'AccountForgetPasswordCtrl'
    })
    .when('/restore-password', {
      templateUrl: 'views/account/restore-password.html',
      controller: 'AccountRestorePasswordCtrl'
    })

    .when('/users', {
      templateUrl: 'views/users/users-list.html',
      controller: 'UsersListCtrl'
    })
    .when('/users/new', {
      templateUrl: 'views/users/user-new.html',
      controller: 'UserNewCtrl'
    })
    .when('/users/:_id/edit', {
      templateUrl: 'views/users/user-edit.html',
      controller: 'UserEditCtrl'
    })

    .when('/term-templates', {
      templateUrl: 'views/term-templates/term-templates-list.html',
      controller: 'TermTemplatesListCtrl'
    })
    .when('/term-templates/new', {
      templateUrl: 'views/term-templates/term-template-new.html',
      controller: 'TermTemplateNewCtrl'
    })
    .when('/term-templates/:_id/edit', {
      templateUrl: 'views/term-templates/term-template-edit.html',
      controller: 'TermTemplateEditCtrl'
    })

    .when('/provision-templates', {
      templateUrl: 'views/provision-templates/provision-templates-list.html',
      controller: 'ProvisionTemplatesListCtrl'
    })
    .when('/provision-templates/new', {
      templateUrl: 'views/provision-templates/provision-template-new.html',
      controller: 'ProvisionTemplateNewCtrl'
    })
    .when('/provision-templates/:_id/edit', {
      templateUrl: 'views/provision-templates/provision-template-edit.html',
      controller: 'ProvisionTemplateEditCtrl'
    })

    .when('/document-template-types', {
      templateUrl: 'views/document-template-types/document-template-types-list.html',
      controller: 'DocumentTemplateTypesListCtrl'
    })
    .when('/document-template-types/new', {
      templateUrl: 'views/document-template-types/document-template-type-new.html',
      controller: 'DocumentTemplateTypeNewCtrl'
    })
    .when('/document-template-types/:_id/edit', {
      templateUrl: 'views/document-template-types/document-template-type-edit.html',
      controller: 'DocumentTemplateTypeEditCtrl'
    })

    .when('/document-templates', {
      templateUrl: 'views/document-templates/document-templates-list.html',
      controller: 'DocumentTemplatesListCtrl'
    })
    .when('/document-templates/new', {
      templateUrl: 'views/document-templates/document-template-new.html',
      controller: 'DocumentTemplateNewCtrl'
    })
    .when('/document-templates/:_id/edit', {
      templateUrl: 'views/document-templates/document-template-edit.html',
      controller: 'DocumentTemplateEditCtrl'
    })

    .when('/project-templates', {
      templateUrl: 'views/project-templates/project-templates-list.html',
      controller: 'ProjectTemplatesListCtrl'
    })
    .when('/project-templates/new', {
      templateUrl: 'views/project-templates/project-template-new.html',
      controller: 'ProjectTemplateNewCtrl'
    })
    .when('/project-templates/:_id/edit', {
      templateUrl: 'views/project-templates/project-template-edit.html',
      controller: 'ProjectTemplateEditCtrl'
    })

    .when('/projects', {
      templateUrl: 'views/projects/projects-list.html',
      controller: 'ProjectsListCtrl'
    })
    .when('/projects/new', {
      templateUrl: 'views/projects/project-new.html',
      controller: 'ProjectNewCtrl'
    })
    .when('/projects/:_id/edit', {
      templateUrl: 'views/projects/project-edit.html',
      controller: 'ProjectEditCtrl'
    }).when('/projects/:_id/editor', {
      templateUrl: 'views/projects/project-editor.html'
    })

    .otherwise({
      redirectTo: '/not-found'
    });
})
.config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate','$uibModal',
    function(taRegisterTool, taOptions, $uibModal) {

    taRegisterTool('table', {
      iconclass: 'fa fa-table',
      tooltiptext: 'insert table',
      action: function(deferred, restoreSelection) {
        var self = this;
        $uibModal
          .open({
            templateUrl: 'views/common/insert-table-dialog.html',
            controller: 'InsertTableDialogCtrl',
            resolve: {
              result: function () {
                return {};
              }
            },
            size: 'sm'
          })
          .result
          .then(function(result) {
            if (!result || !result.rows || !result.cols) {
              return;
            }
            deferred.promise
              .then(function() {
                restoreSelection();
                var html = _createTable(result.cols, result.rows);
                self.$editor().wrapSelection('insertHtml', html);
              });
            deferred.resolve();
          });

        return false;
      }
    });

    taOptions.toolbar[1].push('table');
    return taOptions;
  }]);

  function _createTable(colCount, rowCount) {
    var tds = '';
    var colWidth = Math.round(100 / colCount); 
    for (var idxCol = 0; idxCol < colCount; idxCol++) {
      tds= tds + '<td style="width: ' + colWidth + '%"></td>';
    }
    var trs = '';
    for (var idxRow = 0; idxRow < rowCount; idxRow++) {
      trs = trs + '<tr>' + tds + '</tr>';
    }

    return '<table class="table table-bordered">' + trs + '</table>';
  }
/*
  $provide.decorator('taOptions', ['taCustomRenderers', 'taRegisterTool', 'taSelection', '$delegate',
    function(taCustomRenderers, taRegisterTool, taSelection, taOptions) {

    // To make textangular open links in new window. As suggested here: https://github.com/fraywing/textAngular/issues/224
    taCustomRenderers.push({
      selector: 'a',
      renderLogic: function(element){
        element.attr('target', '_blank');
      }
    });

    taCustomRenderers.push({
      selector: 'iframe',
      customAttribute:'ta-insert-video',

      renderLogic: function(iframeOld) {
        var iframeNew = angular.element('<iframe></iframe>');
        var attributes = iframeOld.prop('attributes');
        _.each(attributes, function(attr) {
          iframeNew.attr(attr.name, attr.value);
        });
        iframeNew.attr('style', '');
        iframeNew.attr('src', iframeNew.css('ta-insert-video'));

        var clazz = iframeOld.attr('class');
        var widthWithDimension = iframeOld.css('width');
        if (!widthWithDimension || widthWithDimension === '0px' || widthWithDimension === '0%') {
          widthWithDimension = '100%';
        }
        var widthDimension = widthWithDimension.indexOf('%') !== -1 ? '%' : 'px';
        var width = (widthWithDimension).replace(widthDimension, '');
        var padBottom = width * 0.5625;
        var wrapperHtml = '<div class="video-wrapper :class" style="width: :width; padding-bottom: :padBottom"></div>'
          .replace(':class', clazz)
          .replace(':width', width + widthDimension)
          .replace(':padBottom', padBottom + widthDimension);

        iframeOld.wrap(wrapperHtml);
        iframeOld.replaceWith(iframeNew);
      }
    });

    taRegisterTool('colorPicker', {
      display: '<button><i class="fa fa-pencil"></i><div></div></button>',

      action: function(deferred, restoreSelection) {
        var self = this;

        var isMozilla = /firefox/.test(navigator.userAgent.toLowerCase());
        var $elem = self.$element.find('i');

        self.spectrum = $elem.spectrum({
          color: '#555',
          showPalette: true,
          palette: [
            ['#555', '#000','#444','#666','#999','#ccc','#eee','#f3f3f3'],
            ['#f00','#f90','#ff0','#0f0','#0ff','#00f','#90f','#f0f'],
            ['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#cfe2f3','#d9d2e9','#ead1dc'],
            ['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#b4a7d6','#d5a6bd'],
            ['#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc','#8e7cc3','#c27ba0'],
            ['#c00','#e69138','#f1c232','#6aa84f','#45818e','#3d85c6','#674ea7','#a64d79'],
            ['#900','#b45f06','#bf9000','#38761d','#134f5c','#0b5394','#351c75','#741b47'],
            ['#600','#783f04','#7f6000','#274e13','#0c343d','#073763','#20124d','#4c1130']
          ],
          appendTo: isMozilla ? null : self.$element,
          hide: function(color) {
            $elem.spectrum('destroy');

            deferred.promise
              .then(function() {
                restoreSelection();
                self.$editor().wrapSelection('foreColor', color.toHexString());
              });
            deferred.resolve();
          }
        });

        setTimeout(function() {
          self.spectrum.spectrum('show');
        }, 0);

        return false;
      }
    });

    taOptions.toolbar = [
      [
        'bold', 'italics', 'underline', 'strikeThrough', 'colorPicker', 'ul', 'ol', 'indent',
        'outdent', 'insertImage', 'insertVideo', 'insertLink',
        'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'undo', 'redo'
      ]
    ];

    return taOptions;
  }]);*/
});

angular.module('app').run(function($rootScope) {
  $rootScope.ifCond = function(op, v1, v2) {
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
    }
  };

  $rootScope.ifVariant = function(v, opt) {
    return v === opt;
  };
});