import { useEffect } from 'react';
import { initApp } from './stores/editor-actions';
import { useInitialized } from './stores/editor-store';
import { api } from './utilities/api';
import useAppContext from './utilities/use-app-context';

export interface Props {
  // TS doesn't like this set as ReactNode
  children: any;
}

const Authenticated = (props: Props) => {
  const { children } = props;
  const { config } = useAppContext();
  const initialized = useInitialized();

  let { data: connections } = api.useConnections();

  useEffect(() => {
    if (config && !initialized && connections) {
      initApp(config, connections);
    }
  }, [config, connections, initialized]);

  if (!config) {
    return null;
  }

  if (!initialized) {
    return null;
  }

  return children;
};

export default Authenticated;
