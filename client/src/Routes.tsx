import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Authenticated from './Authenticated';
import NotFound from './NotFound';
import PasswordReset from './pages/PasswordReset';
import PasswordResetRequested from './pages/PasswordResetRequested';
import QueryChartOnly from './pages/QueryChartOnly';
import QueryEditor from './pages/QueryEditor';
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
          <Route exact path="/signin" render={() => <SignIn />} />
          <Route exact path="/signup" render={() => <SignUp />} />
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
          {/* If nothing matches redirect to signin */}
          <Route>
            <Redirect to="/signin" />
          </Route>
        </Switch>
        <RegisterHistory />
      </Router>
    );
  }

  return (
    <Router basename={config.baseUrl}>
      <Switch>
        {/* 
          For queries URLs without sessions, generate a sessionId and redirect to it 
          The session will be initialized within a useEffect
        */}
        <Route
          exact
          path="/queries/:queryIdOrNew"
          render={({ match }) => {
            const sessionId = uuidv4();
            return (
              <Redirect
                to={`/queries/${match.params.queryIdOrNew}/sessions/${sessionId}`}
              />
            );
          }}
        />

        {/* For /queries/new/... prevent a queryId from being captured via params */}
        <Route exact path="/queries/new/sessions/:sessionId">
          <Authenticated>
            <QueryEditor />
          </Authenticated>
        </Route>

        <Route exact path="/queries/:queryId/sessions/:sessionId">
          <Authenticated>
            <QueryEditor />
          </Authenticated>
        </Route>

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

        {/* Just for testing */}
        <Route exact path="/404">
          <NotFound />
        </Route>

        {/* If nothing matches redirect to new query */}
        <Route>
          <Redirect to="/queries/new" />
        </Route>
      </Switch>
      <RegisterHistory />
    </Router>
  );
}

export default Routes;
