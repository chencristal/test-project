'use strict';

var pdf     = require('html-pdf');
var Promise = require('bluebird');

exports.write = (html, output) => {
  var options = {
    'border': {
      'top': '0.8in',
      'right': '0.5in',
      'bottom': '0.7in',
      'left': '0.7in'
    }
  };
  return new Promise((resolve, reject) => {
    pdf
      .create(html, options)
      .toStream((err, pdfStream) => {
        if (err) {
          return reject(err);
        }
        pdfStream.pipe(output);
        pdfStream.on('end', resolve);
        pdfStream.on('error', reject);
      });
  });
};
