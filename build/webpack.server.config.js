const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const ROOT_DIR = path.resolve(__dirname, '../')

module.exports = {
  target: 'node',
  entry: {
    app: './src/server-entry.jsx'
  },
  output: {
    path: path.resolve(ROOT_DIR, 'dist'),
    filename: 'bundle.js',
    library: 'entry',
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      '@': path.resolve(ROOT_DIR, 'src')
    },
    extensions: [".js", ".jsx"]
  },
  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/
  }),
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      '_SERVER_': JSON.stringify(true)
    })
  ]
}