import React, { useEffect } from 'react';
import FullscreenMessage from './common/FullscreenMessage';
import useAppContext from './utilities/use-app-context';

function NotFound() {
  const { currentUser } = useAppContext();

  useEffect(() => {
    document.title = 'SQLPad - Not Found';
  }, []);

  // TODO FIXME XXX -
  // Now that the nav bar is gone do we just render link to new query?
  // Or just show modal saying "query not found" ok/close goes to new query?
  // with the query list open?
  if (currentUser) {
    return <FullscreenMessage>Not Found</FullscreenMessage>;
  }
  return <FullscreenMessage>Not Found</FullscreenMessage>;
}

export default NotFound;
