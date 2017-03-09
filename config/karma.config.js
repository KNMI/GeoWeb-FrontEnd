const argv = require('yargs').argv;
const project = require('./project.config');
const webpackConfig = require('./webpack.config');
const debug = require('debug')('app:config:karma');

debug('Creating configuration.');
const karmaConfig = {
  captureTimeout: 2000,
  browserDisconnectTimeout: 2000,
  browserDisconnectTolerance: 3,
  browserNoActivityTimeout: 10000,

  basePath : '../', // project root in relation to bin/karma.js

  // only use PhantomJS for our 'test' browser
  browsers: ['jsdom'],

  // just run once by default unless --watch flag is passed
  singleRun: !argv.watch,

  // which karma frameworks do we want integrated
  frameworks: ['mocha', 'chai'],

  // displays tests in a nice readable format
  reporters: ['spec', 'istanbul'],

  // include some polyfills
  files: [
    'node_modules/babel-polyfill/dist/polyfill.js',
    './node_modules/phantomjs-polyfill/bind-polyfill.js',
    // './src/test/*.js',
    './src/**/*.spec.js' // specify files to watch for tests
  ],
  preprocessors : {

    // these files we want to be precompiled with webpack
    // also run tests through sourcemap for easier debugging
    './src/**/*.spec.js': ['webpack'],
    './src/test/*.js': ['webpack'],
    './src/static/**/*.js': ['webpack'],
    './src/**/*.js': ['webpack', 'sourcemap'],
    './src/**/*.jsx': ['webpack', 'sourcemap']
  },
  webpack  : {
    devtool: 'inline-source-map',
    resolve: Object.assign({}, webpackConfig.resolve, {

      // required for enzyme to work properly
      alias: {
        'sinon': 'sinon/pkg/sinon'
      }
    }),
    module: Object.assign({}, webpackConfig.module, {

      // don't run babel-loader through the sinon module
      noParse: [
        /node_modules\/sinon\//
      ]
    }),

    // required for enzyme to work properly
    externals: Object.assign({}, webpackConfig.externals, {
      'jsdom': 'window',
      'cheerio': 'window',
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    })
  },
  webpackMiddleware : {
    noInfo : true
  },
  plugins: webpackConfig.plugins.concat([
    'karma-babel-preprocessor',
    'karma-chai',
    'karma-istanbul',
    'karma-jsdom-launcher',
    'karma-mocha',
    'karma-sourcemap-loader',
    'karma-spec-reporter',
    'karma-webpack'
  ]),
  istanbulReporter: {
    dir : 'coverage/',
    reporters : project.coverage_reporters
  }
};
module.exports = (cfg) => {
  cfg.set(karmaConfig);
  debug('Config set');
};
