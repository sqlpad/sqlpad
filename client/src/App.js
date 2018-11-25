import Component from '@reactions/component'
import message from 'antd/lib/message'
import React from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom'
import { Subscribe } from 'unstated'
import Authenticated from './Authenticated'
import ConfigurationView from './configuration/ConfigurationView'
import ConnectionsView from './connections/ConnectionsView.js'
import AppContainer from './containers/AppContainer'
import ForgotPassword from './ForgotPassword.js'
import NotFound from './NotFound.js'
import PasswordReset from './PasswordReset.js'
import PasswordResetRequested from './PasswordResetRequested.js'
import QueriesView from './queries/QueriesView'
import QueryChartOnly from './QueryChartOnly.js'
import QueryEditorContainer from './queryEditor/QueryEditorContainer.js'
import QueryTableOnly from './QueryTableOnly.js'
import SignIn from './SignIn.js'
import SignUp from './SignUp.js'
import UsersView from './users/UsersView'

// Configure message notification globally
message.config({
  top: 60,
  duration: 2,
  maxCount: 3
})

class App extends React.Component {
  renderRoutes(appState) {
    const { config } = appState

    return (
      <Router basename={config.baseUrl}>
        <div className="flex w-100">
          <Switch>
            <Route exact path="/" render={() => <Redirect to={'/queries'} />} />
            <Route
              exact
              path="/queries"
              render={props => (
                <Authenticated>
                  <QueriesView />
                </Authenticated>
              )}
            />
            <Route
              exact
              path="/queries/:queryId"
              render={({ match }) => (
                <Authenticated>
                  <QueryEditorContainer queryId={match.params.queryId} />
                </Authenticated>
              )}
            />
            <Route
              exact
              path="/users"
              render={() => (
                <Authenticated admin>
                  <UsersView />
                </Authenticated>
              )}
            />
            <Route
              exact
              path="/connections"
              render={() => (
                <Authenticated admin>
                  <ConnectionsView />
                </Authenticated>
              )}
            />
            <Route
              exact
              path="/config-values"
              render={() => (
                <Authenticated admin>
                  <ConfigurationView />
                </Authenticated>
              )}
            />
            <Route
              exact
              path="/query-table/:queryId"
              render={({ match }) => (
                <QueryTableOnly queryId={match.params.queryId} />
              )}
            />
            <Route
              exact
              path="/query-chart/:queryId"
              render={({ match }) => (
                <QueryChartOnly queryId={match.params.queryId} />
              )}
            />
            <Route exact path="/signin" render={() => <SignIn />} />
            <Route exact path="/signup" render={() => <SignUp />} />
            <Route
              exact
              path="/forgot-password"
              render={() => <ForgotPassword />}
            />
            <Route
              exact
              path="/password-reset/:passwordResetId"
              render={({ match }) => (
                <PasswordReset passwordResetId={match.params.passwordResetId} />
              )}
            />
            <Route
              exact
              path="/password-reset"
              render={() => <PasswordResetRequested />}
            />
            <Route render={() => <NotFound />} />
          </Switch>
        </div>
      </Router>
    )
  }

  render() {
    return (
      <Subscribe to={[AppContainer]}>
        {appContainer => {
          if (appContainer.state.config) {
            return this.renderRoutes(appContainer.state)
          }
          return (
            <div className="flex w-100">
              <Component didMount={appContainer.refreshAppContext} />
            </div>
          )
        }}
      </Subscribe>
    )
  }
}

export default App
