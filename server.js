const Koa = require('koa')
const asset = require('koa-static')
const router = require('koa-router')()
const app = new Koa();

const ReactDOMServer = require('react-dom/server')
const Hello = require('./src/hello')

var html = ReactDOMServer.renderToString(
  Hello
);

app.use(async(ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
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
    <!-- <script src="https://cdn.bootcss.com/react/16.1.1/cjs/react.development.js"></script> -->
  </head>
  
  <body>
    <div id="root">${template}</div>
  </body>
  
  </html>`
}

// add url-route:
router.get('/api/hello/:name', async(ctx, next) => {
  var name = ctx.params.name;
  // let jsonObj = {
  //   data: 'The Result From Koa2-server'
  // }
  ctx.response.body = render(html)
});

// add router middleware:
app.use(router.routes())

app.listen(3000)