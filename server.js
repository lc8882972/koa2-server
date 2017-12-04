const Koa = require('koa')
const asset = require('koa-static')
const router = require('koa-router')()
const app = new Koa();

const entry = require('./dist/bundle').entry.default

app.use(async(ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(asset(__dirname + '/dist', {
  extensions: ['html', 'js']
}))

function render(template) {
  return `<!DOCTYPE html>
  <html lang="zh-CN">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Koa2-server</title>
  </head>

  <body>
    <div id="root">${template}</div>
    <script src="/bundle.client.js"></script>
  </body>

  </html>`
}

// add url-route:
router.get('/api/hello/:name', async(ctx, next) => {
  var name = ctx.params.name;
  let html = entry()
  ctx.response.body = render(html)
});

// add router middleware:
app.use(router.routes())

app.listen(3000)