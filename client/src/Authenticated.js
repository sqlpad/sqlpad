import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from './stores/unistoreStore';
import { Redirect } from 'react-router-dom';

function Authenticated({ admin, children, currentUser, refreshAppContext }) {
  useEffect(() => {
    refreshAppContext();
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

export default connect(
  ['currentUser'],
  actions
)(Authenticated);
