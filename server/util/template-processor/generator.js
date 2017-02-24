'use strict';

var _ = require('lodash');

exports.generate = (tokensRoot, variables) => {
  return new Promise((resolve, reject) => {
    try {
      var generator = new Generator(variables);
      var html = generator.generateHtml(tokensRoot);
      resolve(html);
    } catch (err) {
      reject(err);
    }
  });
};

function Generator(allowedVariables) {
  this.allowedVariables = allowedVariables;
}

Generator.prototype.generateHtml = function (token) {
  if (!token) {
    return '';
  }

  var self = this;

  switch (token.type) {
    case 'content':
      return token.text || '';
    case 'program':
      return _.map(token.tokens, self.generateHtml.bind(self)).join('');
    case 'variable':
      var variable = _.find(self.allowedVariables, {'variable': token.text});
      return self.generateVariableEditor.call(self, variable);
    case 'statement':
      return self.generateExpressionHtml(token);
  }
};

Generator.prototype.generateVariableEditor = function (variable) {
  var varName = `variables.${variable.variable}`;
  switch (variable.termType) {
    case 'text':
      return `
        <span class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}">
        <input type="text"
               ng-model="${varName}.value"
               ng-blur="onChange()"
               ng-click="onClick(${varName}, $event)"
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null"
               ng-disabled="${varName}.state == 1"
               placeholder="{{ ${varName}.text.placeholder }}" /></span>`;

    case 'boolean':
      return `
        <span ng-click="onClick(${varName}, $event)"
              ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null">
          <label>
            <input type="radio" 
                   ng-model="${varName}.value" 
                   ng-value="true" 
                   ng-change="onChange()" 
                   ng-disabled="${varName}.state == 1"/>
            <span>{{ ::${varName}.boolean.inclusionText }}</span>
          </label>
           <label>
            <input type="radio" 
                   ng-model="${varName}.value" 
                   ng-value="false" 
                   ng-change="onChange()"
                   ng-disabled="${varName}.state == 1"/>
            <span>{{ ::${varName}.boolean.exclusionText }}</span>
          </label>
        </span>`;

    case 'variant':
      return `
        <select ng-model="${varName}.value"
                ng-options="opt.value as opt.value for opt in ${varName}.variant.options"
                ng-change="onChange()"
                ng-click="onClick(${varName}, $event)"
                ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null" 
                ng-disabled="${varName}.state == 1">
        </select>`;

    case 'date':
      var uniqId = _getRandomString();
      return `
        <span class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}">
        <input type="text"
               class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}"
               ng-model="${varName}.value"
               ng-click="datePickers.isOpened_${uniqId} = true; onClick(${varName}, $event)"
               ng-required="true"
               ng-change="onChange()"
               uib-datepicker-popup="MMMM d, yyyy"
               is-open="datePickers.isOpened_${uniqId}"
               datepicker-options="dateOptions"
               close-text="Close"
               datepicker-append-to-body="true" 
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null" 
               ng-disabled="${varName}.state == 1"/></span>`;

    case 'number':
      return `
        <span class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}">
        <input type="number"
               ng-model="${varName}.value"
               ng-blur="onChange()"
               ng-click="onClick(${varName}, $event)"
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null"
               ng-disabled="${varName}.state == 1"
               placeholder="{{ ${varName}.number.placeholder }}" /></span>`;

    case 'default':
      // TODO: what to do here?
      return '';
  }
};

Generator.prototype.generateExpressionHtml = function (token) {
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var param3 = token.params[2];

  switch (token.text) {
    case 'if':
      html += `<span 
        class="
          exp-if 
          {{ variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}" 
        ng-class="{
          selected: variables.${param1.text}.value, 
          unselected: !variables.${param1.text}.value, 
          highlighted: selectedVariable === variables.${param1.text} }">`;
      break;

    case 'unless':
      html += `<span 
        class="
          exp-unless 
          {{ variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}" 
        ng-class="{
          selected: !variables.${param1.text}.value,
          unselected: variables.${param1.text}.value,
          highlighted: selectedVariable === variables.${param1.text} }">`;
      break;

    case 'ifCond':
      html += `<span 
        class="
          {{ variables.${param1.text}.state == 2 && variables.${param2.text}.state == 2 && variables.${param3.text}.state == 2 ? 'uncertain-bracket' : null }}" 
        ng-class="{ unselected: !$root.ifCond('${param1.text}', variables.${param2.text}.value, 
        variables.${param3.text}.value) }">`;
      break;

    case 'ifVariant':
      html += `<span 
        class="
          {{ variables.${param1.text}.state == 2 && variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}" 
        ng-class="{ unselected: !$root.ifVariant(`;
      html += `variables.${param1.text}.value`;
      html += `, '${param2.text}'`;
      html += `) }">`;
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
  }
  html += _.map(token.tokens, self.generateHtml.bind(self)).join('');
  html += `</span>`;

  return html;
};

Generator.prototype.generateMathHtml = function(token) {    // chen_debug
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var param3 = token.params[2];
  var date1 = _.find(self.allowedVariables, 
    {
      'variable': token.params[0].text, 
      'termType': 'date'
    });

  if (date1 === undefined) {    // first variable is not date
    if (param1.type == 'variable' && param3.type == 'variable') {
      html = `
          <span class="{{ variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}">
          <label ng-class="selectedVariable == variables.${param1.text} ? 'highlighted-for-scroll' : null"
                 ng-disabled="variables.${param1.text}.state == 1"
                 placeholder="{{ variables.${param1.text}.number.placeholder }}">
                 {{$root.math(variables.${param1.text}.value, '${param2.text}', variables.${param3.text}.value)}}
          </label>`;
    }
    else if (param1.type == 'variable' && param3.type == 'constant') {
      html = `
          <span class="{{ variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}">
          <label ng-class="selectedVariable == variables.${param1.text} ? 'highlighted-for-scroll' : null"
                 ng-disabled="variables.${param1.text}.state == 1"
                 placeholder="{{ variables.${param1.text}.number.placeholder }}">
                 {{$root.math(variables.${param1.text}.value, '${param2.text}', ${param3.text})}}
          </label>`;
    }
    else if (param1.type == 'constant' && param3.type == 'variable') {
      html = `
          <span class="{{ variables.${param3.text}.state == 2 ? 'uncertain-bracket' : null }}">
          <label ng-class="selectedVariable == variables.${param3.text} ? 'highlighted-for-scroll' : null"
                 ng-disabled="variables.${param3.text}.state == 1"
                 placeholder="{{ variables.${param3.text}.number.placeholder }}">
                 {{$root.math(${param1.text}, '${param2.text}', variables.${param3.text}.value)}}
          </label>`;
    }
    else if (param1.type == 'constant' && param3.type == 'constant') {
      html = `
          <span>
          <label>
                 {{$root.math(${param1.text}, '${param2.text}', ${param3.text})}}
          </label>`;
    }
  }
  else {          // first variable is date actually

    var varName = `variables.${date1.variable}`;
    var offsetAttr = ``;
    var uniqId = _getRandomString();

    if (param3.type == 'variable') {
      if (param2.text == 'add' || param2.text == 'add-date' || param2.text == 'add-day') {
        offsetAttr = `ng-offset="variables.${param3.text}.value" ng-date-offset-variable="true"`;
      } else if (param2.text == 'add-month') {
        offsetAttr = `ng-offset-month="variables.${param3.text}.value" ng-date-offset-variable="true"`;
      } else if (param2.text == 'add-year') {
        offsetAttr = `ng-offset-year="variables.${param3.text}.value" ng-date-offset-variable="true"`;
      }
    }
    else if (param3.type == 'constant') {
      if (param2.text == 'add' || param2.text == 'add-date' || param2.text == 'add-day') {
        offsetAttr = `ng-offset="${param3.text}"`;
      } else if (param2.text == 'add-month') {
        offsetAttr = `ng-offset-month="${param3.text}"`;
      } else if (param2.text == 'add-year') {
        offsetAttr = `ng-offset-year="${param3.text}"`;
      }
    }    

    html =  `
        <span class="{{ ${varName}.state == 2 ? 'uncertain-bracket' : null }}">
        <label ng-model="${varName}.value"
               ${offsetAttr}
               ng-required="true"
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null" 
               ng-disabled="${varName}.state == 1"></label></span>`;
  }
  

  return html;
}
Generator.prototype.generateCaseHtml = function(token) {
  console.log(token);
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  if(param2.type == 'variable') {
    html = `
          <span class="{{ variables.${param2.text}.state == 2 ? 'uncertain-bracket' : null }}">
          <label ng-class="selectedVariable == variables.${param2.text} ? 'highlighted-for-scroll' : null"
                 ng-disabled="variables.${param2.text}.state == 1"
                 placeholder="{{ variables.${param2.text}.text.placeholder }}">
                 {{$root.case('${param1.text}', variables.${param2.text}.value)}}
          </label>`;
  }
  else {
    html = `
          <span>
          <label>
                 {{$root.case('${param1.text}', '${param2.text}')}}
          </label>`;
  }

  return html;
}
Generator.prototype.generateArticleHtml = function(token) {
  console.log(token);
  var self = this;
  var html = '';
  var param1 = token.params[0];
  if(param1.type == 'variable') {
    html = `
          <span class="{{ variables.${param1.text}.state == 2 ? 'uncertain-bracket' : null }}">
          <label ng-class="selectedVariable == variables.${param1.text} ? 'highlighted-for-scroll' : null"
                 ng-disabled="variables.${param1.text}.state == 1"
                 placeholder="{{ variables.${param1.text}.text.placeholder }}">
                 {{$root.article(variables.${param1.text}.value)}}
          </label>`;
  }
  else {
    html = `
          <span>
          <label>
                 {{$root.article('${param1.text}')}}
          </label>`;
  }

  return html;
}
function _getRandomString() {
  return Math.random().toString(36).slice(2);
}
