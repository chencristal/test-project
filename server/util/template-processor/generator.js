'use strict';

var _ = require('lodash');

exports.generateHtml = tokensRoot => {
  return _generateHtml(tokensRoot);
};

function _generateHtml(token) {
  if (!token) {
      return '';
  }

  switch (token.type) {
    case 'content':
      return token.text || '';
    case 'program':
      return _.map(token.tokens, _generateHtml).join('');
    case 'variable':
      return `<input ng-model="variables.${token.text}.value" 
placeholder="{{ variables.${token.text}.text.placeholder }}" />`;
    case 'statement':
      var html = '';
      var param1 = token.params[0];
      var param2 = token.params[1];
      var param3 = token.params[2];
      switch (token.text) {
        case 'if':
          html += `<span ng-class="{ invisible: !variables.${param1.text}.value }">`;
          break;
        case 'unless':
          html += `<span ng-class="{ invisible: variables.${param1.text}.value }">`;
          break;
        case 'ifCond':
          html += `<span ng-class="{ invisible: !$root.ifCond(`;
          html += `'${param1.text}'`;
          html += `, variables.${param2.text}.value`;
          html += `, variables.${param3.text}.value`;
          html += ') }">';
          break;
      }
      html += _.map(token.tokens, _generateHtml).join('');
      html += '</span>';
      return html;
  }
}
