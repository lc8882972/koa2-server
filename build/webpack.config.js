const path = require('path')
const nodeExternals = require('webpack-node-externals')

const ROOT_DIR = path.resolve(__dirname, '../')

module.exports = {
  target: 'node',
  entry: { 
    app: './src/server-entry.js' 
  },
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

  ]
}