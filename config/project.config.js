/* eslint key-spacing:0 spaced-comment:0 */
const path = require('path');
const debug = require('debug')('app:config:project');
const argv = require('yargs').argv;
// const ip = require('ip');

debug('Creating default configuration.');
// ========================================================
// Default Configuration
// ========================================================
const config = {
  env : process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Project Structure
  // ----------------------------------
  path_base  : path.resolve(__dirname, '..'),
  dir_client : 'src',
  dir_dist   : 'dist',
  dir_public : 'public',
  dir_server : 'server',
  dir_test   : 'src/test',
  dir_static : 'src/static',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host : process.env.HOST || 'localhost', // ip.address(), // use string 'localhost' to prevent exposure on local network
  server_port : process.env.PORT || 3000,

  // ----------------------------------
  // Compiler Configuration
  // ----------------------------------
  // compiler_devtool         : 'eval',
  compiler_devtool         : 'source-map',
  compiler_hash_type       : 'hash',
  compiler_fail_on_warning : false,
  compiler_quiet           : false,
  compiler_public_path     : '/',
  compiler_stats           : {
    chunks : false,
    chunkModules : false,
    colors : true
  },
  compiler_vendors : [
    '@babel/polyfill',
    'availity-reactstrap-validation',
    'axios',
    'bootstrap',
    'classnames',
    'deep-diff',
    'element-resize-event',
    'es6-enum',
    'immer',
    'ip',
    'jquery',
    'lodash.clonedeep',
    'lodash.escaperegexp',
    'lodash.get',
    'lodash.has',
    'lodash.isequal',
    'lodash.omit',
    'lodash.set',
    'lodash.unset',
    'moment',
    'prop-types',
    'rc-slider',
    'react',
    'react-bootstrap-typeahead',
    'react-code-splitting',
    'react-copy-to-clipboard',
    'react-dom',
    'react-fa',
    'react-json-edit',
    'react-json-tree',
    'react-moment',
    'react-moment-proptypes',
    'react-popper',
    'react-redux',
    'react-router',
    'react-sortable-hoc',
    'react-transition-group',
    'reactstrap',
    'reapop',
    'reapop-theme-wybo',
    'recharts',
    'redux',
    'redux-actions',
    'redux-thunk',
    'uuid',
    'validator'
  ],
  compiler_babel: {
    cacheDirectory: true,
    plugins: ['react-hot-loader/babel']
  }
};

/************************************************
-------------------------------------------------

All Internal Configuration Below
Edit at Your Own Risk

-------------------------------------------------
************************************************/

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
  'process.env'  : {
    'NODE_ENV' : JSON.stringify(config.env)
  },
  'NODE_ENV'     : config.env,
  '__DEV__'      : config.env === 'development',
  '__PROD__'     : config.env === 'production',
  '__COVERAGE__' : !argv.watch && config.env === 'test',
  '__BASENAME__' : JSON.stringify(process.env.BASENAME || '')
};

// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json');

config.compiler_vendors = config.compiler_vendors
  .filter((dep) => {
    if (pkg.dependencies[dep]) return true;

    debug(
      `Package "${dep}" was not found as an npm dependency in package.json; ` +
      `it won't be included in the webpack vendor bundle.
       Consider removing it from \`compiler_vendors\` in ~/config/index.js`
    );
  });

// ------------------------------------
// Utilities
// ------------------------------------
function base () {
  const args = [config.path_base].concat([].slice.call(arguments));
  return path.resolve.apply(path, args);
}

config.paths = {
  base   : base,
  client : base.bind(null, config.dir_client),
  public : base.bind(null, config.dir_public),
  dist   : base.bind(null, config.dir_dist),
  static : base.bind(null, config.dir_static)
};

// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`);
const environments = require('./environments.config');
const overrides = environments[config.env];
if (overrides) {
  debug('Found overrides, applying to default configuration.');
  Object.assign(config, overrides(config));
} else {
  debug('No environment overrides found, defaults will be used.');
}

module.exports = config;
