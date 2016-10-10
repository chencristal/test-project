'use strict';

var pdf     = require('html-pdf');
var Promise = require('bluebird');

exports.createPdf = (html, output) => {
  return new Promise((resolve, reject) => {
    pdf
      .create(html)
      .toStream((err, stream) => {
        if (err) {
          return reject(err);
        }
        stream.pipe(output);
        stream.on('close', resolve);
        stream.on('error', reject);
      });
  });
};
