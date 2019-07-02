const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const project = require('./project.config');
const debug = require('debug')('app:config:webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const __DEV__ = project.globals.__DEV__;
const __PROD__ = project.globals.__PROD__;

debug('Creating awesome webpack configuration.');
const webpackConfig = {
  devServer: {
    host: process.env.HOST || 'localhost', // your ip address
    port: process.env.PORT || 3000,
    historyApiFallback: true,
    watchContentBase: true
  },
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
  module: {},
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: ['node_modules', 'src/**/*.spec.js']
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.client('main.js');

webpackConfig.entry = {
  app: [APP_ENTRY],
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
webpackConfig.externals['basemaps'] = JSON.stringify(require('./basemaps.json'));

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(project.globals),

  new CopyWebpackPlugin([
    { from: 'src/static' }
  ]),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
];

if (__DEV__) {
  debug('Enabling plugins for live development (HMR, NoErrors).');
  webpackConfig.mode = 'development';
  webpackConfig.plugins.push(
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
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  );
} else if (__PROD__) {
  debug('Enabling plugins for production (OccurenceOrder, Dedupe & UglifyJS).');
  webpackConfig.mode = 'production';
  webpackConfig.optimization.minimizer = [
    new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        compress: {
          drop_console: true,
          keep_infinity: true
        }
      }
    })
  ];
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: project.paths.client('index.prod.html'),
      hash: false,
      favicon: project.paths.client('components/assets/icon.ico'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
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
    exclude: /(node_modules)/,
    loader: 'babel-loader',
    options: project.compiler_babel,
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
