var gulp = require('gulp');
var util = require('gulp-util');
var webpack = require('webpack');
var WebPackDevServer = require('webpack-dev-server');
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var autoprefixer = require('autoprefixer-stylus');

gulp.task('watch', function () {
  gulp.watch('public/stylus/*.styl', ['stylus']);
});

gulp.task('stylus', function () {
  gulp.src('public/stylus/*.styl')
    .pipe(stylus({
      use: [autoprefixer]
    }))
    .pipe(gulp.dest('./public/build'));
});

gulp.task('webpack', function (callback) {
  webpack({
    entry: {
      slide: './public/js/slide.js',
      canvas: './public/js/canvas.js',
      orientation: './public/js/orientation.js'
    },
    output: {
      path: './public/build',
      filename: '[name].js'
    },
    module: {
      loaders: [
        { test: /\.(js|jsx)$/, loader: 'babel-loader'}
      ]
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    devtool: 'source-map',
    watch: true
  }, function (err, stats) {
    if(err) throw new gutil.PluginError('webpack', err);
    util.log('[webpack]', stats.toString({
      colors: true,
      chunks: false
    }));
  });
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js',
    ignore: ['public/*'],
    ext: 'js html',
    env: {'NODE_ENV': 'development'}
  });
});

gulp.task('default', ['stylus', 'webpack', 'watch', 'nodemon']);
