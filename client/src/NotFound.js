import React, { useContext, useEffect } from 'react';
import AppNav from './AppNav.js';
import FullscreenMessage from './common/FullscreenMessage.js';
import AppContext from './containers/AppContext';

export default function NotFound() {
  const appContext = useContext(AppContext);
  const { currentUser } = appContext;

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
