const argv = require('yargs').argv;
const project = require('./project.config');
const webpackConfig = require('./webpack.config');
const debug = require('debug')('app:config:karma');
const path = require('path');

debug('Creating configuration.');
const karmaConfig = {
  basePath : '../', // project root in relation to bin/karma.js

  // only use PhantomJS for our 'test' browser
  browsers: ['PhantomJS'],

  // just run once by default unless --watch flag is passed
  singleRun: !argv.watch,

  // which karma frameworks do we want integrated
  frameworks: ['mocha', 'chai'],

  // displays tests in a nice readable format
  reporters: ['spec'],

  // include some polyfills
  files: [
    {
      pattern  : `./${project.dir_test}/testSetup.js`,
      watched  : false,
      served   : true,
      included : true
    } // ,
    // './**/*.spec.js' // specify files to watch for tests
  ],
  preprocessors : {

    // these files we want to be precompiled with webpack
    // also run tests through sourcemap for easier debugging
    // [`${project.dir_test}/testSetup.js`] : ['webpack', 'sourcemap'],
    // './**/*.spec.js': ['babel']
    './**/*.spec.js': ['webpack', 'sourcemap']
  },
  webpack  : {
    devtool: 'inline-source-map',
    resolve: {

      // allow us to import components in tests like:
      // import Example from 'components/Example';
      modules: [
        path.resolve(__dirname, './src')
      ],

      // allow us to avoid including extension name
      extensions: ['.js', '.jsx'],

      // required for enzyme to work properly
      alias: {
        'sinon': 'sinon/pkg/sinon'
      }
    },
    module: {

      // don't run babel-loader through the sinon module
      noParse: [
        /node_modules\/sinon\//
      ],

      // run babel loader for our tests
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude : /(node_modules|test)/,
          loader: 'babel-loader',
          options : project.compiler_babel
        }
      ]
    },

    // required for enzyme to work properly
    externals: {
      'jsdom': 'window',
      'cheerio': 'window',
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    }
  },
  webpackMiddleware : {
    noInfo : true
  },

  plugins: Object.assign([], webpackConfig.plugins, [
    'karma-mocha',
    'karma-chai',
    'karma-webpack',
    'karma-phantomjs-launcher',
    'karma-spec-reporter',
    'karma-sourcemap-loader',
    'karma-babel-preprocessor'
  ]),
  coverageReporter : {
    dir: 'coverage',
    reporters : project.coverage_reporters
  }
};

if (project.globals.__COVERAGE__) {
  // karmaConfig.reporters.push('coverage');
  karmaConfig.webpack.module.rules = [{
    test    : /\.(js|jsx)$/,
    enforce : 'pre',
    include : new RegExp(project.dir_client),
    exclude : /(node_modules|test|\.(test|spec)\.js$|\.scss$|\.jpg$)/,
    loader  : 'babel-loader',
    options   : Object.assign({}, project.compiler_babel, {
      plugins : (project.compiler_babel.plugins || []).concat('istanbul')
    })
  }];
}

module.exports = (cfg) => cfg.set(karmaConfig);
