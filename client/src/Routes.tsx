import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import PasswordReset from './pages/PasswordReset';
import PasswordResetRequested from './pages/PasswordResetRequested';
import QueryChartOnly from './pages/QueryChartOnly';
import QueryEditorWrapper from './pages/QueryEditorWrapper';
import QueryTableOnly from './pages/QueryTableOnly';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { RegisterHistory } from './utilities/history';
import useAppContext from './utilities/use-app-context';

function Routes() {
  const { config, currentUser } = useAppContext();

  // If no config yet return null
  // Config is needed in order to mount app at proper basename
  if (!config) {
    return null;
  }

  // If not signed in only allow auth related routes
  if (!currentUser) {
    return (
      <Router basename={config.baseUrl}>
        <Switch>
          <Route exact path="/signin" children={<SignIn />} />
          <Route exact path="/signup" children={<SignUp />} />
          <Route
            exact
            path="/password-reset/:passwordResetId"
            children={<PasswordReset />}
          />
          <Route
            exact
            path="/password-reset"
            children={<PasswordResetRequested />}
          />
          {/* If nothing matches redirect to signin */}
          <Route children={<Redirect to="/signin" />} />
        </Switch>
        <RegisterHistory />
      </Router>
    );
  }

  return (
    <Router basename={config.baseUrl}>
      <Switch>
        {/* For /queries/new prevent a queryId from being captured via params */}
        <Route exact path="/queries/new" children={<QueryEditorWrapper />} />

        <Route
          exact
          path="/queries/:queryId"
          children={<QueryEditorWrapper />}
        />

        <Route
          exact
          path="/query-table/:queryId"
          children={<QueryTableOnly />}
        />

        <Route
          exact
          path="/query-chart/:queryId"
          children={<QueryChartOnly />}
        />

        {/* If nothing matches redirect to new query */}
        <Route children={<Redirect to="/queries/new" />} />
      </Switch>
      <RegisterHistory />
    </Router>
  );
}

export default Routes;
