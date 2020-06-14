import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import initApp from './stores/initApp';
import useAppContext from './utilities/use-app-context';

function Authenticated({ children, initApp, initialized }) {
  const { config, currentUser } = useAppContext();

  useEffect(() => {
    if (config) {
      initApp(config);
    }
  }, [initApp, config]);

  if (!config) {
    return null;
  }

  if (config && !currentUser) {
    return <Redirect to={{ pathname: '/signin' }} />;
  }

  if (!initialized) {
    return null;
  }

  return children;
}

export default connect(['initialized'], {
  initApp,
})(Authenticated);
