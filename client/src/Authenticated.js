import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { Redirect } from 'react-router-dom';
import initApp from './stores/initApp';

function Authenticated({ children, currentUser, initApp, initialized }) {
  useEffect(() => {
    initApp();
  }, [initApp]);

  if (!currentUser) {
    return <Redirect to={{ pathname: '/signin' }} />;
  }

  if (!initialized) {
    return null;
  }

  return children;
}

export default connect(['currentUser', 'initialized'], {
  initApp,
})(Authenticated);
