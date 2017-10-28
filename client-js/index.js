import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import App from './App.js'
import UserAdmin from './UserAdmin.js'
import ConnectionsView from './connections/ConnectionsView.js'
import ConfigValues from './ConfigValues.js'
import FilterableQueryList from './FilterableQueryList.js'
import QueryEditor from './queryEditor/QueryEditor.js'
import SignIn from './SignIn.js'
import SignUp from './SignUp.js'
import ForgotPassword from './ForgotPassword.js'
import PasswordReset from './PasswordReset.js'
import PasswordResetRequested from './PasswordResetRequested.js'
import QueryTableOnly from './QueryTableOnly.js'
import QueryChartOnly from './QueryChartOnly.js'
import NotFound from './NotFound.js'

class Main extends React.Component {
  state = {}

  componentDidMount() {
    fetchJson('GET', 'api/app')
      .then(json => {
        // NOTE: this was previously run every route.
        // This may need to be exposed or refreshed intelligently
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
      .catch(ex => {
        console.error(ex.toString())
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
            <App config={config} currentUser={currentUser}>
              <Component {...props} />
            </App>
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
            <App config={config} currentUser={currentUser}>
              <Component {...props} />
            </App>
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
    // NOTE react-route allows for composable routes/layout
    // This should be revisited once this is understood more
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
              <FilterableQueryList config={config} currentUser={currentUser} />
            ))}
            {this.authenticatedRoute('/queries/:queryId', ({ match }) => (
              <QueryEditor queryId={match.params.queryId} config={config} />
            ))}
            {this.adminRoute('/users', () => (
              <UserAdmin config={config} currentUser={currentUser} />
            ))}
            {this.adminRoute('/connections', () => (
              <ConnectionsView config={config} />
            ))}
            {this.adminRoute('/config-values', () => (
              <ConfigValues config={config} />
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
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('root'))
