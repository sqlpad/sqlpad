import React, { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import { connect } from 'unistore/react';
import { refreshAppContext } from './stores/config';
import { initSelectedConnection } from './stores/connections';
import { initSchema } from './stores/schema';
import SpinKitCube from './common/SpinKitCube';

const Authenticated = lazy(() => import('./Authenticated'));
const ForgotPassword = lazy(() => import('./ForgotPassword.js'));
const NotFound = lazy(() => import('./NotFound.js'));
const PasswordReset = lazy(() => import('./PasswordReset.js'));
const PasswordResetRequested = lazy(() =>
  import('./PasswordResetRequested.js')
);
const QueryChartOnly = lazy(() => import('./QueryChartOnly.js'));
const QueryEditor = lazy(() => import('./queryEditor/QueryEditor.js'));
const QueryTableOnly = lazy(() => import('./QueryTableOnly.js'));
const SignIn = lazy(() => import('./SignIn.js'));
const SignUp = lazy(() => import('./SignUp.js'));

function Routes({
  config,
  refreshAppContext,
  initSchema,
  initSelectedConnection
}) {
  useEffect(() => {
    refreshAppContext();
    initSchema();
    initSelectedConnection();
  }, [refreshAppContext, initSchema, initSelectedConnection]);

  if (!config) {
    return null;
  }

  return (
    <Router basename={config.baseUrl}>
      <Suspense
        fallback={
          <div style={{ marginTop: 100 }}>
            <SpinKitCube />
          </div>
        }
      >
        <Switch>
          <Route
            exact
            path="/"
            render={() => <Redirect to={'/queries/new'} />}
          />
          <Route
            exact
            path="/queries"
            render={() => <Redirect to={'/queries/new'} />}
          />
          <Route
            exact
            path="/queries/:queryId"
            render={({ match }) => (
              <Authenticated>
                <QueryEditor queryId={match.params.queryId} />
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
      </Suspense>
    </Router>
  );
}

export default connect(
  ['config'],
  { refreshAppContext, initSchema, initSelectedConnection }
)(Routes);
