import React, { useContext } from 'react';
import AppNav from '../AppNav';
import { ConnectionsContext } from '../connections/ConnectionsStore';
import AppContext from '../containers/AppContext';
import QueryEditor from './QueryEditor';

function QueryEditorContainer(props) {
  const appContext = useContext(AppContext);
  const connectionsContext = useContext(ConnectionsContext);

  return (
    <AppNav>
      <QueryEditor
        connections={connectionsContext.connections}
        loadConnections={connectionsContext.loadConnections}
        selectedConnectionId={connectionsContext.selectedConnectionId}
        selectConnection={connectionsContext.selectConnection}
        {...appContext}
        {...props}
      />
    </AppNav>
  );
}

export default QueryEditorContainer;
