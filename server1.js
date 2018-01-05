const webpack = require('webpack')
const koaWebpackMiddleware = require('koa-webpack-middleware');
const { devMiddleware, hotMiddleware } = koaWebpackMiddleware
const devConfig = require('./build/webpack.client.config');

const Koa = require('koa')
const asset = require('koa-static')
const router = require('koa-router')()
const compile = webpack(devConfig)

const app = new Koa();
app.use(asset('./public'));
app.use(devMiddleware(compile, {
  // display no info to console (only warnings and errors) 
  noInfo: false,

  // display nothing to the console 
  quiet: false,

  // custom headers 
  headers: { "X-Custom-Header": "yes" },

  // options for formating the statistics 
  stats: {
    colors: true
  }
}))
app.use(hotMiddleware(compile, {
  // log: console.log, 
  path: '/__webpack_hmr',
}))

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`)
})

// app.use(asset(__dirname + '/dist', {
//   extensions: ['js']
// }))


app.listen(3000)