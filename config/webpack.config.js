const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const project = require('./project.config');
const debug = require('debug')('app:config:webpack');
const WebpackStrip = require('strip-loader');

const __DEV__ = project.globals.__DEV__;
const __PROD__ = project.globals.__PROD__;

debug('Creating awesome webpack configuration.');
const webpackConfig = {
  devServer: { historyApiFallback: true },
  name     : 'client',
  target   : 'web',
  devtool  : project.compiler_devtool,
  resolve  : {
    modules    : [
      project.paths.client(),
      'node_modules'
    ],
    extensions : ['.js', '.jsx', '.json'],
    enforceExtension : false
  },

  module: {}
};
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.client('main.js');

webpackConfig.entry = {
  app : __DEV__
    ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`)
    : [APP_ENTRY],
  libs: project.compiler_vendors
};

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename   : `[name].[${project.compiler_hash_type}].js`,
  path       : project.paths.dist(),
  publicPath : project.compiler_public_path
};

// ------------------------------------
// Externals
// ------------------------------------
webpackConfig.externals = {};
webpackConfig.externals['react/lib/ExecutionEnvironment'] = true;
webpackConfig.externals['react/lib/ReactContext'] = true;
webpackConfig.externals['react/addons'] = true;

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(project.globals),
  new HtmlWebpackPlugin({
    template : project.paths.client('index.html'),
    hash     : false,
    favicon  : project.paths.public('favicon.ico'),
    filename : 'index.html',
    inject   : 'body',
    minify   : {
      collapseWhitespace : true
    }
  })
];

if (__DEV__) {
  debug('Enabling plugins for live development (HMR, NoErrors).');
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  );
} else if (__PROD__) {
  debug('Enabling plugins for production (OccurenceOrder, Dedupe & UglifyJS).');
  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        unused    : true,
        dead_code : true,
        warnings  : false
      },
      sourceMap: true
    }),
    new webpack.optimize.AggressiveMergingPlugin()
  );
}

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON
// /^(?!.*(main|reducers|test\.(test|spec)\.js$)).*\.jsx?$/
// /(node_modules|test|\.(test|spec)\.js$)/
webpackConfig.module.rules = [
  {
    test    : /\.(js|jsx)$/,
    exclude : /(node_modules|static)/,
    loader  : 'babel-loader',
    options : project.compiler_babel,
    enforce : 'pre'
  },
  {
    test    : /\.json$/,
    loader  : 'json-loader',
    enforce : 'pre'
  }
];

// Remove debug statements in production
if (__PROD__) {
  webpackConfig.module.rules.push({ test: /\.js$/, loader: WebpackStrip.loader('debug', 'console.log', 'console.debug') });
}

// ------------------------------------
// Style Loaders
// ------------------------------------
webpackConfig.module.rules.push({
  test    : /\.s?css$/,
  use : [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
});

// File loaders
webpackConfig.module.rules.push(
  {
    test: /\.woff(\?.*)?$/,
    loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff'
  },
  {
    test: /\.woff2(\?.*)?$/,
    loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2'
  },
  {
    test: /\.otf(\?.*)?$/,
    loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype'
  },
  {
    test: /\.ttf(\?.*)?$/,
    loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream'
  },
  {
    test: /\.eot(\?.*)?$/,
    loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]'
  },
  {
    test: /\.svg(\?.*)?$/,
    loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml'
  },
  {
    test: /\.(png|jpg)$/,
    loader: 'url-loader?limit=8192'
  }
);

module.exports = webpackConfig;
