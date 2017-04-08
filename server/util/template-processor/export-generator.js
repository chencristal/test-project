'use strict';

var _       = require('lodash');
var moment  = require('moment');

exports.generateExport = (tokensRoot, data) => {
  return new Promise((resolve, reject) => {
    try {
      var generatorExport = new GeneratorExport(data);
      var html = generatorExport.generateExportHtml(tokensRoot);
      resolve(html);
    } catch (err) {
      reject(err);
    }
  });
};

function GeneratorExport(data) {
  this.data = data;
}

GeneratorExport.prototype.generateExportHtml = function (token) {
  if (!token) {
    return '';
  }

  var self = this;

  if (token.type === undefined) {   // chen_debug (if the token is array)
    return _.map(token, self.generateExportHtml.bind(self)).join('');
  }
  else {
    switch (token.type) {
      case 'content':
        return token.text || '';
      case 'program':
        return _.map(token.tokens, self.generateExportHtml.bind(self)).join('');
      case 'variable':
        var variable = _.find(self.data.termTempls, {'variable': token.text});
        return self.generateExportVariableEditor.call(self, variable);
      case 'statement':
        return self.generateExportExpressionHtml(token);
    }
  }
};

GeneratorExport.prototype.generateExportVariableEditor = function (variable) {
  var self = this;

  var projValues = self.data.projValues;
  var termTempls = self.data.termTempls;

  var value = _.find(self.data.projValues, {'variable': variable.variable});
  var term = _.find(self.data.termTempls, {'variable': variable.variable});

  switch (variable.termType) {
    case 'text': 
      return (value.value || value.placeholder);
    case 'textplus':
      var subs = _getSubFields(projValues, variable.variable);
      var newline = term.textplus.newline ? true : false;
      var prettify = term.textplus.prettify ? true : false;
      var html = '<span>' + value.value + '</span>';
      /*_.forEach(subs, function(sub, key) {
        html += `<span>`;
        if (!newline && !prettify) html += `<span> </span>`;
        if (prettify && key !== subs.length - 1) html += `<span class="prettify">, </span>`;
        if (prettify && key === subs.length - 1) html += `<span class="prettify"> and </span>`;
        if (newline) html += `<br />`;
        html += sub.value;
        html += `</span>`;
      });*/

      return html;

    case 'textarea':
      return (value.value || value.placeholder);
    case 'boolean':
      if (value.value === 'true')
        return term.boolean.inclusionText;
      else
        return term.boolean.exclusionText;
    case 'variant':
      return value.value;

    case 'date':
      var offsetDate = new Date(value.value);
      var val = moment(offsetDate).format('MMMM D, YYYY');
      return `<span>${val}</span>`;

    case 'number':
      var val = value.value;
      return `<span>${val}</span>`;

    case 'default':
      // TODO: what to do here?
      return '';
  }
};

GeneratorExport.prototype.generateExportExpressionHtml = function (token) {

  var self = this;

  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var param3 = token.params[2];

  var projValues = self.data.projValues;
  var termTempls = self.data.termTempls;

  function _parseBoolean(text) {
    var _temp = _.find(projValues, {'variable': text});
    return (_temp !== undefined && (_temp.value == 'true' || _temp.value == true));
  }
  
  function _parseIfCond() {
    var v1 = _parseBoolean(param1.text),
        op = param2.text,
        v2 = _parseBoolean(param3.text);

    return _ifCond(v1, op, v2);
  }

  function _parseIfVariant() {
    var text = param1.text,
        op = param2.text;
    var _temp = _.find(projValues, {'variable': text});

    return (_temp !== undefined && _ifVariant(_temp.value, op));
  }

  switch (token.text) {
    case 'if':
      var _term = _.find(termTempls, {'variable': param1.text});
      var value = _parseBoolean(param1.text);

      var defaulted = (value == _term.boolean.default) ? 'defaulted' : '';
      var selected = (value) ? 'selected' : 'unselected';

      html += `<span class="exp-if ${defaulted} ${selected} highlighted">`;
      break;

    case 'unless':
      var _term = _.find(termTempls, {'variable': param1.text});
      var value = _parseBoolean(param1.text);

      var defaulted = (value !== _term.boolean.default) ? 'defaulted' : '';
      var selected = (value) ? 'unselected' : 'selected';

      html += `<span class="exp-unless ${defaulted} ${selected} highlighted">`;
      break;

    case 'ifCond':
      var _term1 = _.find(termTempls, {'variable': param1.text});
      var _term2 = _.find(termTempls, {'variable': param3.text});
      var value = _parseIfCond();
      var defaultValue = _ifCond(_term1.boolean.default, param2.text, _term2.boolean.default);

      var defaulted = (value == defaultValue) ? 'defaulted' : '';
      var selected = (value) ? 'selected' : 'unselected';
      html += `<span class="exp-ifcond ${defaulted} ${selected} highlighted">`;
      break;

    case 'ifVariant':
      var _term = _.find(termTempls, {'variable': param1.text});
      var value = _parseIfVariant();
      var defaultValue = _ifVariant(_term.variant.default, param2.text);

      var defaulted = (value === defaultValue) ? 'defaulted' : '';
      var selected = (value) ? 'selected' : 'unselected';
      html += `<span class="exp-ifvariant ${defaulted} ${selected} highlighted">`;
      break;

    case 'unlessVariant':
      var _term = _.find(termTempls, {'variable': param1.text});
      var value = _parseIfVariant();
      var defaultValue = _ifVariant(_term.variant.default, param2.text);

      var defaulted = (value !== defaultValue) ? 'defaulted' : '';
      var selected = (value) ? 'unselected' : 'selected';
      html += `<span class="exp-unlessvariant ${defaulted} ${selected} highlighted">`;
      break;

    case 'math':  // chen_debug
      html = self.generateMathHtml.call(self, token);
      break;

    case 'case':
      html = self.generateCaseHtml.call(self, token);
      break;

    case 'article':
      html = self.generateArticleHtml.call(self, token);
      break;
    case 'pagebreak':
      html = '<div style="page-break-after:always;"></div>';
      break;
    case 'expand':
      html = self.generateExpandHtml.call(self, token);
      break;
  }
  html += _.map(token.tokens, self.generateExportHtml.bind(self)).join('');
  html += `</span>`;

  return html;
};

GeneratorExport.prototype.generateMathHtml = function(token) {
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var param3 = token.params[2];

  var projValues = self.data.projValues;
  var termTempls = self.data.termTempls;

  var date1 = _.find(termTempls, 
    {
      'variable': token.params[0].text, 
      'termType': 'date'
    });

  if (date1 === undefined) {    // first variable is not date
    var _temp1 = _.find(projValues, {'variable': param1.text});
    var _temp2 = _.find(projValues, {'variable': param3.text});
    var value = '';

    if (param1.type == 'variable' && param3.type == 'variable')
      value = _math(_temp1.value, param2.text, _temp2.value);
    else if (param1.type == 'variable' && param3.type == 'constant')
      value = _math(_temp1.value, param2.text, param3.text);
    else if (param1.type == 'constant' && param3.type == 'variable')
      value = _math(param1.text, param2.text, _temp2.value);
    else if (param1.type == 'constant' && param3.type == 'constant')
      value = _math(param1.text, param2.text, param3.text);
    html = `<span><label>${value}</label>`;
  }
  else {          // first variable is date actually

    var _temp2 = _.find(projValues, {'variable': param3.text});
    var offsetDate = new Date(date1.value);
    var value = '';

    if (param3.type == 'variable') {
      if (param2.text == 'add' || param2.text == 'add-date' || param2.text == 'add-day') {
        offsetDate.setDate(offsetDate.getDate() + _temp2.value);
      } else if (param2.text == 'add-month') {
        offsetDate.setMonth(offsetDate.getMonth() + _temp2.value);
      } else if (param2.text == 'add-year') {
        offsetDate.setFullYear(offsetDate.getFullYear() + _temp2.value);
      }
    }
    else if (param3.type == 'constant') {
      if (param2.text == 'add' || param2.text == 'add-date' || param2.text == 'add-day') {
        offsetDate.setDate(offsetDate.getDate() + param3.text);
      } else if (param2.text == 'add-month') {
        offsetDate.setMonth(offsetDate.getMonth() + param3.text);
      } else if (param2.text == 'add-year') {
        offsetDate.setFullYear(offsetDate.getFullYear() + param3.text);
      }
    }

    value = moment(offsetDate).format('MMMM D, YYYY');
    html = `<span><label>${value}</label>`;
  }  

  return html;
}
GeneratorExport.prototype.generateCaseHtml = function(token) {
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var value = '';
  if(param2.type == 'variable') {
    var _temp = _.find(projValues, {'variable': param2.text});
    value = _case(param1.text, _temp.value);
    html = `<span><label>${value}</label>`;
  }
  else {
    value = _case(param1.text, param2.text);
    html = `<span><label>${value}</label>`;
  }

  return html;
}
GeneratorExport.prototype.generateArticleHtml = function(token) {
  var self = this;
  var html = '';
  var param1 = token.params[0];  
  var value = '';
  if(param1.type == 'variable') {
    var _temp = _.find(projValues, {'variable': param1.text});
    value = _article(_temp.value);
  }
  else {
    value = _article(param1.text);
  }
  html = `<span><label>${value}</label>`;

  return html;
}
GeneratorExport.prototype.generateExpandHtml = function(token) {
  var self = this;
  var html = '';

  var param = token.params[0];
  var mode = parseInt(token.params[1].text);

  if(param.type == 'variable') {
    var master = param.text;
    var varName = `variables.${master}`;
    var newline = false,
        prettify = false;
    switch(mode) {
      case 0:
        newline = false;
        prettify = false;
      break;
      case 1:
        newline = false;
        prettify = true;
      break;
      case 2:
        newline = true;
        prettify = false;
      break;
      case 3:
        newline = true;
        prettify = true;
      break;
      default:
        newline = false;
        prettify = false;
      break;
    }
    html =  `
        <span class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}">
        <input type="text"
               ng-model="${varName}.value"
               ng-blur="onChange()"
               ng-click="onClick(${varName}, $event)"
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null"
               ng-disabled="${varName}.state == 1"
               placeholder="{{ ${varName}.placeholder }}" /></span>
        <span class="{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}" ng-repeat="v in textplus['${master}'] | objectToArray | orderBy: 'sortIndex'">
               <span ng-if="!${newline} && !${prettify}"> </span>
               <span class="prettify" ng-if="${prettify} && !$last">, </span>
               <span class="prettify" ng-if="${prettify} && $last">and </span>
               <br ng-if="${newline}" />
        <input type="text"
               ng-model="variables[v.variable].value"
               ng-blur="onChange()"
               ng-click="onClick(variables[v.variable], $event)"
               ng-class="selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null"
               ng-disabled="variables[v.variable].state == 1"
               placeholder="{{ variables[v.variable].placeholder }}" />
        </span>
    `;
  }
  else
    html = '';

  return html;
}

exports.getExportCss = function() {
  return `
    .selected {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .unselected {
      display: none;
    }
    .exp-if.selected {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #000;
    }
    .exp-if.selected.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-if.selected.highlighted {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #00f;
    }
    .exp-if.selected.highlighted.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-if.unselected {
      display: inline;
      color: #d3d3d3;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-if.unselected.defaulted {
      display: none;
    }
    .exp-if.unselected.highlighted {
      color: #f00;
      text-decoration: line-through;
    }
    .exp-if.unselected.highlighted.defaulted {
      display: none;
    }
    .exp-unless.unselected {
      display: none;
    }
    .exp-unless.unselected.defaulted {
      display: inline;
      color: #d3d3d3;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-unless.unselected.highlighted.defaulted {
      color: #f00;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-unless.selected {
      display: inline;
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-unless.selected.defaulted {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #000;
    }
    .exp-unless.selected.highlighted {
      display: inline;
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-unless.selected.highlighted.defaulted {
      display: inline;
      color: #00f;
      font-weight: bold;
      text-decoration: underline;
    }
    .exp-ifcond.selected {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #000;
    }
    .exp-ifcond.selected.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-ifcond.selected.highlighted {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #00f;
    }
    .exp-ifcond.selected.highlighted.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-ifcond.unselected {
      display: inline;
      color: #d3d3d3;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-ifcond.unselected.defaulted {
      display: none;
    }
    .exp-ifcond.unselected.highlighted {
      color: #f00;
      text-decoration: line-through;
    }
    .exp-ifcond.unselected.highlighted.defaulted {
      display: none;
    }
    .exp-ifvariant.selected {
      display: inline;
      text-decoration: none;
      font-weight: normal;
      color: #000;
    }
    .exp-ifvariant.selected.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-ifvariant.selected.highlighted {
      display: inline;
      text-decoration: none;
      font-weight: normal;
      color: #000;
    }
    .exp-ifvariant.selected.highlighted.defaulted {
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-ifvariant.unselected {
      display: inline;
      color: #d3d3d3;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-ifvariant.unselected.defaulted {
      display: none;
    }
    .exp-ifvariant.unselected.highlighted {
      color: #f00;
      text-decoration: line-through;
    }
    .exp-ifvariant.unselected.highlighted.defaulted {
      display: none;
    }
    .exp-unlessvariant.unselected {
      display: none;
    }
    .exp-unlessvariant.unselected.defaulted {
      display: inline;
      color: #d3d3d3;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-unlessvariant.unselected.highlighted.defaulted {
      color: #f00;
      font-weight: normal;
      text-decoration: line-through;
    }
    .exp-unlessvariant.selected {
      display: inline;
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-unlessvariant.selected.defaulted {
      display: inline;
      text-decoration: underline;
      font-weight: bold;
      color: #000;
    }
    .exp-unlessvariant.selected.highlighted {
      display: inline;
      color: #000;
      font-weight: normal;
      text-decoration: none;
    }
    .exp-unlessvariant.selected.highlighted.defaulted {
      display: inline;
      color: #00f;
      font-weight: bold;
      text-decoration: underline;
    }
  `;
};

function _getRandomString() {
  return Math.random().toString(36).slice(2);
}

function _ifCond(v1, op, v2) {
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

function _ifVariant(v, opt) {
  return v === opt;
}

function _math(v1, op, v2) {  
  if(isNaN(v1)) v1 = 0;
  if(isNaN(v2)) v2 = 0;

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
}

function _case(op, v) {
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
}

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

function _article(v) {
  if(v == undefined)
    return '';
  return AvsAnSimple.query(v);
}

function _getSubFields(variables, text) {
  var master = _.find(variables, {'variable': text});
  var subs = _.filter(variables, function(v) { return v.variable.indexOf(text + '__') === 0;});
  if(!subs || subs.length == 0)
    subs = [master];
  subs = _.orderBy(subs, ['sortIndex'],['asc']);
  return subs;
}