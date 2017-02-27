'use strict';

angular.module('app', [
  'ngResource',
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  'ui.select',
  'textAngular',
  'mwl.confirm',
  'ngAnimate'
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
    .when('/terms', {
      templateUrl: 'views/terms.html',
      controller: 'TermOfServiceCtrl'
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

var AvsAnSimple = (function (root) {
    var dict = "2h.#2.a;i;&1.N;*4.a;e;i;o;/9.a;e;h1.o.i;l1./;n1.o.o;r1.e.s1./;01.8;12.1a;01.0;12.8;9;2.31.7;4.5.6.7.8.9.8a;0a.0;1;2;3;4;5;6;7;8;9;11; .22; .–.31; .42; .–.55; .,.h.k.m.62; .k.72; .–.82; .,.92; .–.8;<2.m1.d;o;=1.=1.E;@;A6;A1;A1.S;i1;r1;o.m1;a1;r1; .n1;d1;a1;l1;u1;c1.i1.a1.n;s1;t1;u1;r1;i1;a1;s.t1;h1;l1;e1;t1;e1.s;B2.h2.a1.i1;r1;a.á;o1.r1.d1. ;C3.a1.i1.s1.s.h4.a2.i1.s1;e.o1.i;l1.á;r1.o1.í;u2.i;r1.r1.a;o1.n1.g1.j;D7.a1.o1.q;i2.n1.a1.s;o1.t;u1.a1.l1.c;á1. ;ò;ù;ư;E7;U1;R.b1;o1;l1;i.m1;p1;e1;z.n1;a1;m.s1;p5.a1.c;e;h;o;r;u1.l1;o.w1;i.F11. ;,;.;/;0;1;2;3;4;5;6;71.0.8;9;Ae;B.C.D.F.I2.L.R.K.L.M.N.P.Q.R.S.T.B;C1;M.D;E2.C;I;F1;r.H;I3.A1;T.R1. ;U;J;L3.C;N;P;M;O1. ;P1;..R2.A1. ;S;S;T1;S.U2.,;.;X;Y1;V.c;f1.o.h;σ;G7.e1.r1.n1.e;h1.a3.e;i;o;i1.a1.n1.g;o2.f1. ;t1.t1. ;r1.i1.a;w1.a1.r1.r;ú;Hs. ;&;,;.2;A.I.1;2;3;5;7;B1;P.C;D;F;G;H1;I.I6;C.G.N.P.S1.D;T.K1.9;L;M1;..N;O2. ;V;P;R1;T.S1.F.T;V;e2.i1.r;r1.r1.n;o2.n6;d.e1.s;g.k.o2;l.r1;i1.f;v.u1.r;I3;I2;*.I.n1;d1;e1;p1;e1;n1;d2;e1;n1;c1;i.ê.s1;l1;a1;n1;d1;s.J1.i1.a1.o;Ly. ;,;.;1;2;3;4;8;A3. ;P;X;B;C;D;E2. ;D;F1;T.G;H1.D.I1.R;L;M;N;P;R;S1;m.T;U1. ;V1;C.W1.T;Z;^;a1.o1.i1.g;o1.c1.h1.a1;b.p;u1.s1.h1;o.ộ;M15. ;&;,;.1;A1;.1;S./;1;2;3;4;5;6;7;8;Ai;B.C.D.F.G.J.L.M.N.P.R.S.T.V.W.X.Y.Z.B1;S1;T.C;D;E3.P1;S.W;n;F;G;H;I4. ;5;6;T1;M.K;L;M;N;O1.U;P;Q;R;S;T1;R.U2. ;V;V;X;b1.u1.m;f;h;o2.D1.e.U1;..p1.3;s1.c;Ny. ;+;.1.E.4;7;8;:;A3.A1;F.I;S1.L;B;C;D;E3.A;H;S1. ;F1;U.G;H;I7.C.D1. ;K.L.N.O.S.K;L;M1;M.N2.R;T;P1.O1.V1./1.B;R2;J.T.S1;W.T1;L1.D.U1.S;V;W2.A;O1.H;X;Y3.C1.L;P;U;a1.s1.a1.n;t1.h;v;²;×;O5;N1;E.l1;v.n2;c1.e.e1.i;o1;p.u1;i.P1.h2.i1.a;o2.b2;i.o.i;Q1.i1.n1.g1.x;Rz. ;&;,;.1;J./;1;4;6;A3. ;.;F1;T.B1;R.C;D;E3. ;S1.P;U;F;G;H1.S;I2.A;C1. ;J;K;L1;P.M5;1.2.3.5.6.N;O2.H;T2;A.O.P;Q;R1;F.S4;,...?.T.T;U4;B.M.N.S.V;X;c;f1;M1...h2.A;B;ò;S11. ;&;,;.4.E;M;O;T1..3.B;D;M;1;3;4;5;6;8;9;A3. ;8;S2;E.I.B;C3.A1. ;R2.A.U.T;D;E6. ;5;C3;A.O.R.I1.F.O;U;F3;&.H.O1.S.G1;D.H3.2;3;L;I2. ;S1.O.K2.I.Y.L3;A2. ;.;I1. ;O.M3;A1. ;I.U1.R.N5.A.C3.A.B.C.E.F.O.O5. ;A1.I;E;S1;U.V;P7;A7;A.C.D.M.N.R.S.E1. ;I4;C.D.N.R.L1;O.O.U.Y.Q1. ;R;S1;W.T9.A1. ;C;D;F;I;L;M;S;V;U7.B.L.M.N.P.R.S.V;W1.R;X1.M;h1.i1.g1.a1.o;p1.i1.o1;n.t2.B;i1.c1.i;T4.a2.i2.g1.a.s1.c;v1.e1.s;e1.a1.m1.p;u1.i2.l;r;à;Um..1.N1..1.C;/1.1;11. .21.1;L1.T;M1.N;N4.C1.L;D2. .P.K;R1. .a;b2;a.i.d;g1.l;i1.g.l2;i.y.m;no. ;a1.n.b;c;d;e1;s.f;g;h;i2.d;n;j;k;l;m;n;o;p;q;r;s;t;u;v;w;p;r3;a.e.u1.k;s3. ;h;t1;r.t4.h;n;r;t;x;z;í;W2.P1.:4.A1.F;I2.B;N1.H.O1.V;R1.F1.C2.N.U.i1.k1.i1.E1.l1.i;X7;a.e.h.i.o.u.y.Y3.e1.t1.h;p;s;[5.A;E;I;a;e;_2._1.i;e;`3.a;e;i;a7; .m1;a1;r1. .n1;d2; .ě.p1;r1;t.r1;t1;í.u1;s1;s1;i1. .v1;u1;t.d3.a1.s1. ;e2.m1. ;r1. ;i2.c1.h1. ;e1.s1.e2.m;r;e8;c1;o1;n1;o1;m1;i1;a.e1;w.l1;i1;t1;e1;i.m1;p1;e1;z.n1;t1;e1;n1;d.s2;a1. .t4;a1; .e1; .i1;m1;a1;r.r1;u1.t.u1.p1. ;w.f3. ;M;y1.i;h9. ;,;.;C;a1.u1.t1;b.e2.i1.r1;a.r1.m1.a1.n;o4.m2.a1; .m;n8; .b.d.e3; .d.y.g.i.k.v.r1.s1. ;u1.r;r1. ;t1;t1;p1;:.i6;b1;n.e1;r.n2;f2;l1;u1;ê.o1;a.s1;t1;a1;l1;a.r1; .s1; .u.k1.u1. ;l3.c1.d;s1. ;v1.a;ma. ;,;R;b1.a.e1.i1.n;f;p;t1.a.u1.l1.t1.i1.c1.a1.m1.p1.i;×;n6. ;V;W;d1; .t;×;o8;c2;h1;o.u1;p.d1;d1;y.f1; .g1;g1;i.no. ;';,;/;a;b;c1.o;d;e2.i;r;f;g;i;l;m;n;o;r;s;t;u;w;y;z;–;r1;i1;g1;e.t1;r1.s;u1;i.r3. ;&;f;s9.,;?;R;f2.e.o.i1.c1.h;l1. ;p2.3;i1. ;r1.g;v3.a.e.i.t2.A;S;uc; ...b2.e;l;f.k2.a;i;m1;a1. .n3;a3; .n5.a;c;n;s;t;r1;y.e2; .i.i8.c2.o1.r1.p;u1.m;d1;i1.o;g1.n;l1.l;m1;o.n;s1.s;v1.o1;c.r5;a.e.i.l.o.s3. ;h;u1.r2;e.p3;a.e.i.t2.m;t;v.w1.a;xb. ;';,;.;8;b;k;l;m1;a.t;y1. ;y1.l;{1.a;|1.a;£1.8;À;Á;Ä;Å;Æ;É;Ò;Ó;Ö;Ü;à;á;æ;è;é1;t3.a;o;u;í;ö;ü1; .Ā;ā;ī;İ;Ō;ō;œ;Ω;α;ε;ω;ϵ;е;–2.e;i;ℓ;";
    function fill(node) {
        var kidCount = parseInt(dict, 36) || 0,
            offset = kidCount && kidCount.toString(36).length;
        node.article = dict[offset] == "." ? "a" : "an";
        dict = dict.substr(1 + offset);
        for (var i = 0; i < kidCount; i++) {
            var kid = node[dict[0]] = {}
            dict = dict.substr(1);
            fill(kid);
        }
    }
    fill(root);

    return {
        raw: root,
        //Usage example: AvsAnSimple.query("example") 
        //example returns: "an"
        query: function (word) {
            var node = root, sI = 0, result, c;
            do {
                c = word[sI++];
            } while ('"‘’“”$\''.indexOf(c) >= 0);//also terminates on end-of-string "undefined".

            while (1) {
                result = node.article || result;
                node = node[c];
                if (!node) return result;
                c = word[sI++] || " ";
            }
        }
    };
})({});

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

  $rootScope.math = function(v1, op, v2) {  // chen_debug
    switch (op) {
      case 'add':
      case 'plus':
        return v1 + v2;
      case 'subtract':
      case 'minus':
        return v1 - v2;
      case 'multiply':
      case 'multiplied by':
        return v1 * v2;
      case 'divide':
      case 'divided by':
        return v1 / v2;
      case 'modulus':
      case 'modulo':
        return v1 % v2;
    }
  };

  $rootScope.case = function(op, v) {
    if(v == undefined)
      return '';
    var camelCase = (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
      }).replace(/\s+/g, '');
    }
    var titleCase = (str) => {
      return str.toLowerCase().replace(/\b[a-z]/g, firstLetter => {return firstLetter.toUpperCase();})
    }
    
    v = v.toString();
    switch(op) {
      case 'lower':
        return v.toLowerCase();
      case 'upper':
        return v.toUpperCase();
      case 'title':
        return titleCase(v);
      default:
        throw new Error('Invalid operator');
    }
  };

  $rootScope.article = function(v) {
    if(v == undefined)
      return '';
    return AvsAnSimple.query(v);

  };

  $rootScope.ifVariant = function(v, opt) {
    return v === opt;
  };
});