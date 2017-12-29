const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const koaMiddleware = require('koa-webpack-middleware')
const { devMiddleware, hotMiddleware } = koaMiddleware
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

module.exports = function setupDevServer(app, opts) {

  const clientCompiler = webpack(clientConfig)
  clientCompiler.plugin('done', () => {
    const fs = devMiddleware.fileSystem
    const filePath = path.join(clientConfig.output.path, 'index.html')
    if (fs.existsSync(filePath)) {
      const fileStream = fs.readFileSync(filePath, 'utf-8')
      opts.htmlUpdated(fileStream)
    }
  })

  // dev middleware
  app.use(devMiddleware(clientCompiler, {
    stats: {
      colors: true,
      chunks: false
    }
  }))

  // hot middleware
  app.use(hotMiddleware(clientCompiler))

  // watch and update server renderer
  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()
  const outputPath = path.join(serverConfig.output.path, serverConfig.output.filename)
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))

    opts.bundleUpdated(mfs.readFileSync(outputPath, 'utf-8'))
  })
}