import NavMini from "../layouts/main/nav/NavMini";

const QueryEditorWrapper = () => {
  const { config } = useAppContext();
  const initialized = useInitialized();

  let { data: connections } = api.useConnections();

  useEffect(() => {
    if (config && !initialized && connections) {
      initEditor(config, connections);
    }
  }, [config, connections, initialized]);

  if (!initialized) {
    return null;
  }

  return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>

              <NavMini />


            <QueryEditor />


      </div>

);
};
import React, { useEffect } from 'react';
import QueryEditor from '../queryEditor/QueryEditor';
import { initEditor } from '../stores/editor-actions';
import { useInitialized } from '../stores/editor-store';
import { api } from '../utilities/api';

import useAppContext from '../utilities/use-app-context';

export default QueryEditorWrapper;
