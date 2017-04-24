const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
      'dexie.mongoify.min': './src/dexie.mongoify.js'
    },
    output: {
        path: './dist',
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        output: {
            comments: false
        }
      })
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          query: {
            "presets": ["es2015"]
          }
        }
      ]
    }
};
