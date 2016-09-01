'use strict';

var gulp        = require('gulp');
var gplumber    = require('gulp-plumber');
var gif         = require('gulp-if');
var gsize       = require('gulp-size');
var gchanged    = require('gulp-changed');
var gcached     = require('gulp-cached');
var gconcat     = require('gulp-concat');
var gremember   = require('gulp-remember');
var gsourcemaps = require('gulp-sourcemaps');
var guglify     = require('gulp-uglify');
var gminifyCss  = require('gulp-minify-css');
var gorder      = require('gulp-order');
var gngAnnotate = require('gulp-ng-annotate');
var gjade       = require('gulp-jade');
var gstylus     = require('gulp-stylus');
var args        = require('../config/gulp').args;
var paths       = require('../config/gulp').paths;
var filters     = require('../config/gulp').filters;

/* jshint camelcase: false */
gulp.task('build-app-js', () => {
  return gulp
    .src(paths.clientJs + filters.jsDeep)
    .pipe(gplumber())
    .pipe(gif(args.isNotProduction, gcached('scripts')))
    .pipe(gsourcemaps.init())
    .pipe(gorder([
      'index.js',
      'main.js',
      '*'
    ]))
    .pipe(gngAnnotate({ single_quotes: true }))
    .pipe(gif(args.isProduction, guglify({ mangle : false })))
    .pipe(gif(args.isNotProduction, gremember('scripts')))
    .pipe(gconcat('app.js'))
    .pipe(gsourcemaps.write('map'))
    .pipe(gsize({
      title: 'app.js'
    }))
    .pipe(gulp.dest(paths.distJs));
});

gulp.task('build-app-css', () => {
  return gulp
    .src(paths.clientCss + filters.stylDeep)
    .pipe(gplumber())
    .pipe(gif(args.isNotProduction, gcached('styles')))
    .pipe(gif(args.isNotProduction, gsourcemaps.init()))
    .pipe(gorder([
      'site.css',
      '*'
    ]))
    .pipe(gstylus())
    .pipe(gif(args.isProduction, gminifyCss()))
    .pipe(gremember('styles'))
    .pipe(gconcat('app.css'))
    .pipe(gif(args.isNotProduction, gsourcemaps.write('map')))
    .pipe(gsize({
      title: 'app.css'
    }))
    .pipe(gulp.dest(paths.distCss));
});

gulp.task('build-app-views', () => {
  return gulp
    .src(paths.clientViews + filters.jadeDeep)
    .pipe(gplumber())
    .pipe(gif(args.isNotProduction, gchanged(paths.distViews, { extension: '.html' })))
    .pipe(gjade())
    .pipe(gsize({
      title: 'app.views'
    }))
    .pipe(gulp.dest(paths.distViews));
});

gulp.task('build-app-img', () => {
  return gulp
    .src(paths.clientImages + filters.imagesDeep)
    .pipe(gplumber())
    .pipe(gsize({
      title: 'app.images'
    }))
    .pipe(gulp.dest(paths.distImages));
});


gulp.task('build-app-src', [
  'build-app-js', 'build-app-css', 'build-app-views', 'build-app-img'
]);
