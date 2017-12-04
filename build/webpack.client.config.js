const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ROOT_DIR = path.resolve(__dirname, '../')

module.exports = {
  entry: './src/client-entry.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.client.js',
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
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}