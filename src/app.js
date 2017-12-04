import React from 'react';
// import createBrowserHistory from 'history/createBrowserHistory'
import { Router, Switch, Route,match } from 'react-router'

// const history = createBrowserHistory()
import routers from '@/routers'

// match()
export default () => {
  return (
    <Router>
      <Switch>
        {routers.map(route => <Route {...route} />)}
      </Switch>
    </Router>)
}