const argv = require('yargs').argv;
const project = require('./project.config');
const webpackConfig = require('./webpack.config');
const debug = require('debug')('app:config:karma');

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
    },
    './**/*.spec.js' // specify files to watch for tests
  ],
  preprocessors : {

    // these files we want to be precompiled with webpack
    // also run tests throug sourcemap for easier debugging
    [`${project.dir_test}/testSetup.js`] : ['webpack', 'sourcemap']
  },
  webpack  : webpackConfig, // {
//   devtool : 'cheap-module-source-map',
//   resolve : Object.assign({}, webpackConfig.resolve, {
//     alias : Object.assign({}, webpackConfig.resolve.alias, {
//       sinon : 'sinon/pkg/sinon.js'
//     })
//   }),
//   plugins : webpackConfig.plugins,
//   module  : {
//     noParse : [
//       /\/sinon\.js/
//     ],
//     rules : webpackConfig.module.rules  .concat([
//       {
//         test   : /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
//         loader : 'imports-loader?define=>false,require=>false'
//       }
//     ])
//   },
    // Enzyme fix, see:
    // https://github.com/airbnb/enzyme/issues/47
//    externals : Object.assign({}, webpackConfig.externals, {
//      'react/addons'                   : true,
//      'react/lib/ExecutionEnvironment' : true,
//      'react/lib/ReactContext'         : 'window'
//    })/*,
//    sassLoader : webpackConfig.sassLoader*/
//  },
  webpackMiddleware : {
    noInfo : true
  },
  coverageReporter : {
    reporters : project.coverage_reporters
  }
};

if (project.globals.__COVERAGE__) {
  karmaConfig.reporters.push('coverage');
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
