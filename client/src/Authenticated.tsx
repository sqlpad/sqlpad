import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import useSWR from 'swr';
import { useQueriesStore } from './stores/queries-store';
import { initApp } from './stores/queries-actions';
import useAppContext from './utilities/use-app-context';

export interface Props {
  children: any;
}

const Authenticated = (props: Props) => {
  const { children } = props;
  const { config, currentUser } = useAppContext();
  const initialized = useQueriesStore((s) => s.initialized);

  let { data: connections } = useSWR('/api/connections');

  useEffect(() => {
    if (config && !initialized && connections) {
      initApp(config, connections);
    }
  }, [config, connections, initialized]);

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
};

export default Authenticated;
