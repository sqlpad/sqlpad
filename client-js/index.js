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

const AuthenticatedRoute = ({
  component: Component,
  config,
  currentUser,
  ...rest
}) => (
  <Route
    {...rest}
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

// TODO eventually make this a not-authorized redirect
const AdminRoute = ({ component: Component, config, currentUser, ...rest }) => (
  <Route
    {...rest}
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
              config={config}
              currentUser={currentUser}
              component={() => (
                <FilterableQueryList
                  config={config}
                  currentUser={currentUser}
                />
              )}
            />
            <AuthenticatedRoute
              exact
              path="/queries/:queryId"
              config={config}
              currentUser={currentUser}
              component={({ match }) => (
                <QueryEditor queryId={match.params.queryId} config={config} />
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
              exact
              path="/users"
              config={config}
              currentUser={currentUser}
              component={() => (
                <UserAdmin config={config} currentUser={currentUser} />
              )}
            />
            <AdminRoute
              exact
              path="/connections"
              config={config}
              currentUser={currentUser}
              component={() => <ConnectionsView config={config} />}
            />
            <AdminRoute
              exact
              path="/config-values"
              config={config}
              currentUser={currentUser}
              component={() => <ConfigValues config={config} />}
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
