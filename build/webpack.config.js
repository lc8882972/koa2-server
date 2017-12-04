const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ROOT_DIR = path.resolve(__dirname, '../')

module.exports = {
  entry: './src/server-entry.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
    library: 'entry',
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      '@': path.resolve(ROOT_DIR, 'src')
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
  },
  plugins: [

  ]
}