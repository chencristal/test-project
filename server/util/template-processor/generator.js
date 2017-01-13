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
               ng-click="onClick(${varName})"
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null"
               ng-disabled="${varName}.state == 1"
               placeholder="{{ ${varName}.text.placeholder }}" /></span>`;

    case 'boolean':
      return `
        <span ng-click="onClick(${varName})"
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
                ng-click="onClick(${varName})"
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
               ng-click="datePickers.isOpened_${uniqId} = true; onClick(${varName})"
               ng-required="true"
               ng-change="onChange()"
               uib-datepicker-popup="MMMM d, yyyy"
               is-open="datePickers.isOpened_${uniqId}"
               datepicker-options="dateOptions"
               close-text="Close"
               datepicker-append-to-body="true" 
               ng-class="selectedVariable == ${varName} ? 'highlighted-for-scroll' : null" 
               ng-disabled="${varName}.state == 1"/></span>`;

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
        ng-class="{ unselected: !$root.ifCond(`;
      html += `'${param1.text}'`;
      html += `, variables.${param2.text}.value`;
      html += `, variables.${param3.text}.value`;
      html += `) }">`;
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
  }
  html += _.map(token.tokens, self.generateHtml.bind(self)).join('');
  html += `</span>`;

  return html;
};

function _getRandomString() {
  return Math.random().toString(36).slice(2);
}
