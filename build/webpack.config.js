const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ROOT_DIR = path.resolve(__dirname, '../')

module.exports = {
  entry: {
    app: [
      'react-hot-loader/patch',
      './src/client-entry.jsx'
    ],
    vendor: [
      'react',
      'react-router',
      'three'
    ]
  },
  output: {
    path: path.resolve(ROOT_DIR, 'dist'),
    filename: '[name].js'
  },
  devtool: 'cheap-module-eval-source-map',
  resolve: {
    alias: {
      '@': path.resolve(ROOT_DIR, 'src')
    },
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      '_CLIENT_': JSON.stringify(true)
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
      chunks: ['vendor']
    }),
    new webpack.HotModuleReplacementPlugin(),
<<<<<<< HEAD
    new webpack.NoEmitOnErrorsPlugin()
=======
    new webpack.NoEmitOnErrorsPlugin(),
>>>>>>> 8b5b7da96c11392c967083f10b6a6368f8036136
  ]
}