import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import initApp from './stores/initApp';
import useAppContext from './utilities/use-app-context';
import useSWR from 'swr';

function Authenticated({ children, initApp, initialized }) {
  const { config, currentUser } = useAppContext();

  let { data: connectionsData } = useSWR('/api/connections');
  const connections = connectionsData || [];

  useEffect(() => {
    if (config && !initialized && connections.length > 0) {
      initApp(config, connections);
    }
  }, [initApp, config, connections, initialized]);

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
