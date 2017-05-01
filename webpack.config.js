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
    plugins: [
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          query: {
            "presets": ["es2015"]
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
