import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import Authenticated from './Authenticated';
import { connect } from 'unistore/react';
import { actions } from './stores/unistoreStore';
import ForgotPassword from './ForgotPassword.js';
import NotFound from './NotFound.js';
import PasswordReset from './PasswordReset.js';
import PasswordResetRequested from './PasswordResetRequested.js';
import QueriesView from './queries/QueriesView';
import QueryChartOnly from './QueryChartOnly.js';
import QueryEditor from './queryEditor/QueryEditor.js';
import QueryTableOnly from './QueryTableOnly.js';
import SignIn from './SignIn.js';
import SignUp from './SignUp.js';

function Routes({ config, refreshAppContext }) {
  useEffect(() => {
    refreshAppContext();
  }, []);

  if (!config) {
    return null;
  }

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
      </div>
    </Router>
  );
}

export default connect(
  ['config'],
  actions
)(Routes);
