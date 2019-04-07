import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from './stores/unistoreStore';
import AppNav from './AppNav.js';
import FullscreenMessage from './common/FullscreenMessage.js';

function NotFound({ currentUser }) {
  useEffect(() => {
    document.title = 'SQLPad - Not Found';
  }, []);

  if (currentUser) {
    return (
      <AppNav>
        <FullscreenMessage>Not Found</FullscreenMessage>
      </AppNav>
    );
  }
  return <FullscreenMessage>Not Found</FullscreenMessage>;
}

export default connect(
  ['currentUser'],
  actions
)(NotFound);
