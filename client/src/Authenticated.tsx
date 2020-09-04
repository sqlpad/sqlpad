import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import initApp from './stores/initApp';
import useAppContext from './utilities/use-app-context';
import useSWR from 'swr';

export interface Props {
  children: any;
  initApp: (config: Object, connections?: Array<Object>) => {};
  initialized?: boolean;
}

const Authenticated = (props: Props) => {
  const { children, initApp, initialized } = props;
  const { config, currentUser } = useAppContext();

  let { data: connections } = useSWR('/api/connections');

  useEffect(() => {
    if (config && !initialized && connections) {
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
};

export default connect<any, any, any, any>(['initialized'], {
  initApp,
})(Authenticated);
