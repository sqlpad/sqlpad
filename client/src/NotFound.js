import React from 'react';
import AppNav from './AppNav.js';
import FullscreenMessage from './common/FullscreenMessage.js';
import AppContext from './containers/AppContext';

export default () => {
  return (
    <AppContext.Consumer>
      {appContext => {
        document.title = 'SQLPad - Not Found';
        const { currentUser } = appContext;

        if (currentUser) {
          return (
            <AppNav>
              <FullscreenMessage>Not Found</FullscreenMessage>
            </AppNav>
          );
        }
        return <FullscreenMessage>Not Found</FullscreenMessage>;
      }}
    </AppContext.Consumer>
  );
};
