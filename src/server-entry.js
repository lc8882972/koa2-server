import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter, Switch, Route, match } from 'react-router'
// import App from './app'
import routers from '@/routers'

const context = {}
const Status = ({ code, children }) => (
  <Route render={({ staticContext }) => {
    if (staticContext)
      staticContext.status = code
    return children
  }} />
)
const NotFound = () => (
  <Status code={404}>
    <div>
      <h1>Sorry, can’t find that.</h1>
    </div>
  </Status>
)

const App = (props) => {
  return (
    <StaticRouter location={props.url} context={context}>
      <Switch>
        {routers.map((route, index) => <Route key={index} {...route} />)}
        <Route component={NotFound} />
      </Switch>
    </StaticRouter>
  )
}

export default (url) => {
  return ReactDOMServer.renderToString(<App url={url} />)
}