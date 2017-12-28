import React from 'react';
import createBrowserHistory from 'history/createBrowserHistory'
import { Router, Switch, Route, match } from 'react-router'

const history = createBrowserHistory()
import routers from '@/routers'

export default () => {
  return (
    <Router history={history}>
      <Switch>
        {routers.map(route => <Route key={route.path} {...route} />)}
      </Switch>
    </Router>)
}