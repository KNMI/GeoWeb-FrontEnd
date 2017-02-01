var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  context: path.join(__dirname, 'src'),
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './js/client.js',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2016'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        },
      },
    ],
  },
  output: {
    path: __dirname + '/dist/',
    filename: 'client.min.js'
  },
  plugins: debug ? [] : [
    // new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({mangle: false, sourcemap: false}),
  ],
  plugins: [
    new CopyWebpackPlugin([
      { from: '.' }
      ])
  ]
};
