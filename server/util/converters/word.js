'use strict';

var _            = require('lodash');
var jsdom        = require('jsdom');
var moment       = require('moment');
var Promise      = require('bluebird');
var fs           = require('fs');
var request      = require('request');
var customErrors = require('n-custom-errors');
var consts       = require('../../consts');
var jquery       = fs.readFileSync('./node_modules/jquery/dist/jquery.js', 'utf-8');

var WEBSRVC_URL = 'http://vps95616.vps.ovh.ca:8080/convert';

exports.write = (html, styles, output, mode) => {
  return new Promise((resolve, reject) => {
    jsdom.env({
      html: html,
      src: [jquery],
      done: function (err, window) {
        if (err) {
          return reject(err);
        }
        var gen = new Generator(window.$, mode);
        var content = gen.generate();

        request({
          method: 'POST',
          url: WEBSRVC_URL,
          timeout: 1800000,
          formData: {
            jsonbody: JSON.stringify(content),
            jsonformat: JSON.stringify(styles)
          }
        }, (err, res, body) => {
          if (err) {
            err = customErrors.getThirdPartyServiceError({ srvcErr: 'JsonToDoc', errMsg: err.message });
            return reject(err);
          }
          if (res.statusCode >= 400) {
            err = customErrors.getThirdPartyServiceError({
              srvcErr: 'JsonToDoc',
              errMsg: body || `Unexpected response status - ${res.statusCode}`
            });
            return reject(err);
          }
          var bodyJs = JSON.parse(body);
          var bodyBuff = new Buffer(bodyJs.base64, 'base64');
          output.write(bodyBuff);
          output.on('end', resolve);
          output.on('error', reject);
          output.end();
        });
      }
    }); 
  });
};

function Generator($, mode) {
  this.$ = $;
  this.mode = mode;
}

Generator.prototype.generate = function() {
  var self = this;
  var now = moment().format('YYYY-MM-DD');
  var content = _.map(self.$('body > *'), self.parseNode.bind(self));

  return {
    documentType: 'Comfort Letter',
    versionType: 'draft',
    draftDescriptor: {
      draftDate: now,
      text: ''
    },
    letterHead: {
      letterDate: now,
      recipient: []
    },
    content: content
  };
};

Generator.prototype.parseNode = function(node) {
  var self = this;
  var $node = self.$(node);

  var content = {
    type: 'paragraph',
    text: '',
    subContent: []
  };

  var tagName = _.toLower($node.prop('tagName'));
  switch (tagName) {
    case 'p':
      content.text = self.getNodeOwnText.call(this, $node);
      break;
    case 'li':
      content.text = self.getNodeOwnText.call(this, $node);
      break;
    case 'ul':
      content.text = self.getNodeOwnText.call(this, $node);
      content.subContent = _.map($node.children('li'), (elem, index) => {
        var subContent = self.parseNode.call(self, elem);
        subContent.index = consts.CHARS[index]; // TODO: can be more than CHARS.length
        return subContent;
      });
      break;
    case 'ol':
      content.text = self.getNodeOwnText.call(this, $node);
      content.subContent = _.map($node.children('li'), (elem, index) => {
        var subContent = self.parseNode.call(self, elem);
        subContent.index = index + 1;
        return subContent;
      });
      break;
    default:
      content.text = $node.text();
      break;
  }

  return content;
};

Generator.prototype.getNodeOwnText = function(node) {
  var self = this;
  var ret = '';
  var nodes = this.$(node)
    .contents()
    .filter(function() {
      if (this.nodeType === 3)
        ret += this.nodeValue;
      else {
        if (this.nodeName === 'SPAN') {
          var tag = checkClassList(self.$(this));
          if (self.mode === 'redline') {
            if (tag === 'normal')
              ret += self.getNodeOwnText.call(self, this);
            else if (tag === 'ins')
              ret += '<ins>' + self.getNodeOwnText.call(self, this) + '</ins>';
            else if (tag === 'del')
              ret += '<del>' + self.getNodeOwnText.call(self, this) + '</del>';
            else
              ret += '';  
          }
          else if (self.mode === 'clean') {
            if (tag === 'normal' || tag === 'ins')
              ret += self.getNodeOwnText.call(self, this);
            else
              ret += '';  
          }
        }
        else if (this.nodeName === 'B') {
          ret += '<b>' + self.getNodeOwnText.call(self, this) + '</b>';
        }
        else if (this.nodeName === 'U') {
          ret += '<u>' + self.getNodeOwnText.call(self, this) + '</u>';
        }
      }
      return this.nodeType === 3;
    });
  return ret;
};

function checkClassList($node) {
  var retArray = [
    // exp-if
    [
      // defaulted
      ['normal', ''],
      // undefaulted
      ['ins', 'del']
    ],
    // exp-unless
    [
      ['ins', 'del'],
      ['normal', 'del']
    ],
    [
      ['normal']
    ]
  ];
  var i_cond = 0, i_default = 0, i_select = 0;
  if ($node.hasClass('exp-unless') || $node.hasClass('exp-unlessvariant')) 
    i_cond = 1;

  if (!$node.hasClass('defaulted'))
    i_default = 1;

  if ($node.hasClass('unselected'))
    i_select = 1;
  
  if (!$node.hasClass('highlighted')) {
    i_cond = 2; i_default = 0; i_select = 0;
  }

  return retArray[i_cond][i_default][i_select];
}