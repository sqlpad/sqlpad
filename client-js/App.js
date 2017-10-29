import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import Alert from 'react-s-alert'
import fetchJson from './utilities/fetch-json.js'
import AppNav from './AppNav.js'
import UsersView from './users/UsersView'
import ConnectionsView from './connections/ConnectionsView.js'
import ConfigurationView from './configuration/ConfigurationView'
import QueriesView from './queries/QueriesView'
import QueryEditor from './queryEditor/QueryEditor.js'
import SignIn from './SignIn.js'
import SignUp from './SignUp.js'
import ForgotPassword from './ForgotPassword.js'
import PasswordReset from './PasswordReset.js'
import PasswordResetRequested from './PasswordResetRequested.js'
import QueryTableOnly from './QueryTableOnly.js'
import QueryChartOnly from './QueryChartOnly.js'
import NotFound from './NotFound.js'

class App extends React.Component {
  state = {}

  componentDidMount() {
    // NOTE: this was previously run every route.
    // This may need to be exposed or refreshed intelligently
    fetchJson('GET', 'api/app').then(json => {
      // Assign config.baseUrl to global
      // It doesn't change and is needed for fetch requests
      // This allows us to simplify the fetch() call
      window.BASE_URL = json.config.baseUrl
      this.setState({
        config: json.config,
        smtpConfigured: json.smtpConfigured,
        googleAuthConfigured: json.googleAuthConfigured,
        currentUser: json.currentUser,
        passport: json.passport,
        adminRegistrationOpen: json.adminRegistrationOpen,
        version: json.version
      })
    })
  }

  // TODO eventually make this a not-authorized redirect
  adminRoute(path, Component) {
    const { config, currentUser } = this.state
    return (
      <Route
        exact
        path={path}
        render={props =>
          currentUser && currentUser.role === 'admin' ? (
            // TODO App does own fetching for this stuff
            // Can App useage just be used within each "page" component
            <AppNav config={config} currentUser={currentUser}>
              <Component {...props} />
            </AppNav>
          ) : (
            <Redirect to={{ pathname: '/queries' }} />
          )}
      />
    )
  }

  authenticatedRoute(path, Component) {
    const { config, currentUser } = this.state
    return (
      <Route
        exact
        path={path}
        render={props =>
          currentUser ? (
            <AppNav config={config} currentUser={currentUser}>
              <Component {...props} />
            </AppNav>
          ) : (
            <Redirect to={{ pathname: '/signin' }} />
          )}
      />
    )
  }

  render() {
    const {
      adminRegistrationOpen,
      config,
      currentUser,
      smtpConfigured,
      passport
    } = this.state

    if (!config) {
      return null
    }
    return (
      <Router basename={config.baseUrl}>
        <div className="flex-100">
          <Switch>
            <Route
              exact
              path="/"
              component={() => <Redirect to={'/queries'} />}
            />
            {this.authenticatedRoute('/queries', () => (
              <QueriesView config={config} currentUser={currentUser} />
            ))}
            {this.authenticatedRoute('/queries/:queryId', ({ match }) => (
              <QueryEditor queryId={match.params.queryId} config={config} />
            ))}
            {this.adminRoute('/users', () => (
              <UsersView config={config} currentUser={currentUser} />
            ))}
            {this.adminRoute('/connections', () => (
              <ConnectionsView config={config} />
            ))}
            {this.adminRoute('/config-values', () => (
              <ConfigurationView config={config} />
            ))}
            <Route
              exact
              path="/query-table/:queryId"
              component={({ match }) => (
                <QueryTableOnly
                  config={config}
                  queryId={match.params.queryId}
                />
              )}
            />
            <Route
              exact
              path="/query-chart/:queryId"
              component={({ match }) => (
                <QueryChartOnly
                  config={config}
                  queryId={match.params.queryId}
                />
              )}
            />
            <Route
              exact
              path="/signin"
              component={() => (
                <SignIn
                  config={config}
                  smtpConfigured={smtpConfigured}
                  passport={passport}
                />
              )}
            />
            <Route
              exact
              path="/signup"
              component={() => (
                <SignUp
                  config={config}
                  adminRegistrationOpen={adminRegistrationOpen}
                />
              )}
            />
            <Route
              exact
              path="/forgot-password"
              component={() => <ForgotPassword config={config} />}
            />
            <Route
              exact
              path="/password-reset/:passwordResetId"
              component={({ match }) => (
                <PasswordReset
                  passwordResetId={match.params.passwordResetId}
                  config={config}
                  adminRegistrationOpen={adminRegistrationOpen}
                />
              )}
            />
            <Route
              exact
              path="/password-reset"
              component={() => <PasswordResetRequested />}
            />
            <Route
              component={() => (
                <NotFound config={config} currentUser={currentUser} />
              )}
            />
          </Switch>
          <Alert stack={{ limit: 3 }} position="bottom-right" />
        </div>
      </Router>
    )
  }
}

export default App
