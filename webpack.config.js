const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
      'dexie-mongoify': './src/dexie.mongoify.js'
    },
    output: {
        path: './dist',
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {test: /\.js?$/, exclude: /node_modules/, loader: 'babel?cacheDirectory'}
      ],
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
            }
          }
        },
        {
          test: /dexie/,
          use: [{
            loader: 'expose-loader',
            options: 'Dexie'
          }]
        }
      ]
    }
};
