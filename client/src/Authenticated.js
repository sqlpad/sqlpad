import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { AppContext } from './stores/AppContextStore';

function Authenticated({ admin, children }) {
  const appContext = useContext(AppContext);
  const { currentUser } = appContext;

  useEffect(() => {
    appContext.refreshAppContext();
  }, []);

  if (!currentUser) {
    return <Redirect to={{ pathname: '/signin' }} />;
  }

  if (admin && currentUser.role !== 'admin') {
    return <Redirect to={{ pathname: '/queries' }} />;
  }

  return children;
}

Authenticated.propTypes = {
  admin: PropTypes.bool
};

export default Authenticated;
