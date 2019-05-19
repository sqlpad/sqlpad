import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { refreshAppContext } from './stores/config';
import { Redirect } from 'react-router-dom';

function Authenticated({ children, currentUser, refreshAppContext }) {
  useEffect(() => {
    refreshAppContext();
  }, [refreshAppContext]);

  if (!currentUser) {
    return <Redirect to={{ pathname: '/signin' }} />;
  }

  return children;
}

Authenticated.propTypes = {
  admin: PropTypes.bool
};

export default connect(
  ['currentUser'],
  {
    refreshAppContext
  }
)(Authenticated);
