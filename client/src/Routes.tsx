import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Authenticated from './Authenticated';
import ForgotPassword from './ForgotPassword';
import NotFound from './NotFound';
import PasswordReset from './PasswordReset';
import PasswordResetRequested from './PasswordResetRequested';
import QueryChartOnly from './QueryChartOnly';
import QueryEditor from './queryEditor/QueryEditor';
import QueryTableOnly from './QueryTableOnly';
import SignIn from './SignIn';
import SignUp from './SignUp';
import useAppContext from './utilities/use-app-context';

function Routes() {
  const { config, currentUser } = useAppContext();

  if (!config) {
    return null;
  }

  function redirectToNew() {
    if (currentUser) {
      return <Redirect to={'/queries/new'} />;
    }
    return <Redirect to={'/signin'} />;
  }

  return (
    <Router basename={config.baseUrl}>
      <Switch>
        <Route exact path="/" render={redirectToNew} />
        <Route exact path="/queries" render={redirectToNew} />
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
    </Router>
  );
}

export default Routes;
