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

Generator.prototype.generateHtml = function(token) {
  if (!token) {
      return '';
  }

  var self = this;
  var index = 0;

  switch (token.type) {
    case 'content':
      return token.text || '';
    case 'program':
      return _.map(token.tokens, self.generateHtml.bind(self)).join('');
    case 'variable':
      var variable = _.find(self.allowedVariables, { 'variable': token.text });
      return self.generateVariableEditor.call(self, variable, ++index);
    case 'statement':
      return self.generateExpressionHtml(token);
  }
};

Generator.prototype.generateVariableEditor = function(variable, index) {
  var varName = `variables.${variable.variable}`;

  switch (variable.termType) {
    case 'text':
      return `
<input type="text"
       ng-model="${varName}.value"
       ng-blur="onChange()"
       placeholder="{{ ${varName}.text.placeholder }}" />`;

    case 'boolean':
      return `
<span>
  <label>
    <input type="radio" ng-model="${varName}.value" ng-value="true" ng-change="onChange()" />
    <span>{{ ::${varName}.boolean.inclusionText }}</span>
  </label>
   <label>
    <input type="radio" ng-model="${varName}.value" ng-value="false" ng-change="onChange()" />
    <span>{{ ::${varName}.boolean.exclusionText }}</span>
  </label>
</span>`;

    case 'variant':
      return `
<select ng-model="${varName}.value"
        ng-options="opt.value as opt.value for opt in ${varName}.variant.options"
        ng-change="onChange()">
</select>`;

    case 'date':
      return `
<input type="text"
       ng-model="${varName}.value"
       ng-click="${varName}.isOpened${index} = true"
       ng-required="true"
       ng-change="onChange()"
       uib-datepicker-popup="MMMM dd, yyyy"
       is-open="${varName}.isOpened${index}"
       datepicker-options="dateOptions"
       close-text="Close"
       datepicker-append-to-body="true" />`;

    case 'default':
      // TODO: what to do here?
      return '';
  }
};

Generator.prototype.generateExpressionHtml = function(token) {
  var self = this;
  var html = '';
  var param1 = token.params[0];
  var param2 = token.params[1];
  var param3 = token.params[2];

  switch (token.text) {
    case 'if':
      html += `<span class="exp-if" ng-class="{
selected: variables.${param1.text}.value, 
unselected: !variables.${param1.text}.value, 
highlighted: selectedVariable === variables.${param1.text} }">`;
      break;

    case 'unless':
      html += `<span class="exp-unless" ng-class="{
selected: !variables.${param1.text}.value,
unselected: variables.${param1.text}.value,
highlighted: selectedVariable === variables.${param1.text} }">`;
      break;

    case 'ifCond':
      html += `<span ng-class="{ unselected: !$root.ifCond(`;
      html += `'${param1.text}'`;
      html += `, variables.${param2.text}.value`;
      html += `, variables.${param3.text}.value`;
      html += ') }">';
      break;

    case 'ifVariant':
      html += `<span ng-class="{ unselected: !$root.ifVariant(`;
      html += `variables.${param1.text}.value`;
      html += `, '${param2.text}'`;
      html += ') }">';
      break;
  }
  console.log('AAA', token.text, html)
  html += _.map(token.tokens, self.generateHtml.bind(self)).join('');
  html += '</span>';

  return html;
};
