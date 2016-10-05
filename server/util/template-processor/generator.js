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
      return `<input ng-model="token.value" placeholder="{{ token.text }}" name="test" />`;
    case 'statement':
      var html = '<span>';
      switch (token.text) {
        case 'if':
          html += _generateHtml(token.params[0]); // TODO: && token.params[0].value"
          break;
        case 'unless':
          html += _generateHtml(token.params[0]); // TODO: && !token.params[0].value")
          break;
        case 'ifCond':
          html += _.map(token.params, _generateHtml).join('');  // TODO: && ifCond(token.params)")
          break;
      }
      html += _.map(token.tokens, _generateHtml).join('');
      html += '</span>';
      return html;
  }
}
