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

const AuthenticatedRoute = ({ component: Component, currentUser, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      currentUser ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/signin',
            state: { from: props.location }
          }}
        />
      )}
  />
)

const AdminRoute = ({ component: Component, currentUser, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      currentUser && currentUser.role === 'admin' ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/signin',
            state: { from: props.location }
          }}
        />
      )}
  />
)

// AUTH = currentUser
// /queries
// /queries/:queryId

class Main extends React.Component {
  state = {}

  componentDidMount() {
    fetchJson('GET', 'api/app')
      .then(json => {
        console.log('loaded')
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
            <AuthenticatedRoute
              exact
              path="/queries"
              currentUser={currentUser}
              component={() => (
                <App config={config} currentUser={currentUser}>
                  <FilterableQueryList
                    config={config}
                    currentUser={currentUser}
                  />
                </App>
              )}
            />
            <AuthenticatedRoute
              exact
              path="/queries/:queryId"
              currentUser={currentUser}
              component={({ match }) => (
                <App config={config} currentUser={currentUser}>
                  <QueryEditor queryId={match.params.queryId} config={config} />
                </App>
              )}
            />
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
            <AdminRoute
              exect
              path="/users"
              component={() => (
                <App config={config} currentUser={currentUser}>
                  <UserAdmin config={config} currentUser={currentUser} />
                </App>
              )}
            />
            <AdminRoute
              exact
              path="/connections"
              component={() => (
                <App config={config} currentUser={currentUser}>
                  <ConnectionsView config={config} />
                </App>
              )}
            />
            <AdminRoute
              exact
              path="/config-values"
              component={() => (
                <App config={config} currentUser={currentUser}>
                  <ConfigValues config={config} />
                </App>
              )}
            />
            <Route
              exect
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
              exect
              path="/signup"
              component={() => (
                <SignUp
                  config={config}
                  adminRegistrationOpen={adminRegistrationOpen}
                />
              )}
            />
            <Route
              exect
              path="/forgot-password"
              component={() => <ForgotPassword config={config} />}
            />
            <Route
              exect
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
              exect
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
