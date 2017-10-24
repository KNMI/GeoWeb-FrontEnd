const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const project = require('./project.config');
const debug = require('debug')('app:config:webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const __DEV__ = project.globals.__DEV__;
const __PROD__ = project.globals.__PROD__;

debug('Creating awesome webpack configuration.');
const webpackConfig = {
  devServer: { historyApiFallback: true },
  name: 'client',
  target: 'web',
  devtool: project.compiler_devtool,
  resolve: {
    modules: [
      project.paths.client(),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json'],
    enforceExtension: false
  },

  module: {}
};
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.client('main.js');

webpackConfig.entry = {
  app: __DEV__
    ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`)
    : [APP_ENTRY],
  libs: project.compiler_vendors
};

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename: `[name].[${project.compiler_hash_type}].js`,
  path: project.paths.dist(),
  publicPath: project.compiler_public_path
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
    template: project.paths.client('index.html'),
    hash: false,
    favicon: project.paths.client('components/assets/icon.ico'),
    filename: 'index.html',
    inject: 'body',
    minify: {
      collapseWhitespace: true
    }
  }),
  new CopyWebpackPlugin([
    { from: 'src/static' }
  ]),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'commons'
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
      parallel: true,
      uglifyOptions: {
        compress: {
          unused: true,
          dead_code: true,
          warnings: false,
          drop_console: true,
          drop_debugger: true,
          conditionals: true,
          keep_infinity: true
        }
      },
      sourceMap: false,
      warnings: false
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
    test: /\.(js|jsx)$/,
    exclude: /(node_modules|static)/,
    loader: 'babel-loader',
    options: project.compiler_babel,
    enforce: 'pre'
  },
  {
    test: /\.json$/,
    loader: 'json-loader',
    enforce: 'pre'
  }
];

// ------------------------------------
// Style Loaders
// ------------------------------------
webpackConfig.module.rules.push({
  test: /\.s?css$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
});

// File loaders
webpackConfig.module.rules.push(
  {
    test: /\.(jpe|png|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
    loader: 'file-loader'
  }
);

module.exports = webpackConfig;
