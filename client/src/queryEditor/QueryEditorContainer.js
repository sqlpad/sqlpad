import React, { useContext } from 'react';
import AppNav from '../AppNav';
import { ConnectionsContext } from '../stores/ConnectionsStore';
import QueryEditor from './QueryEditor';

function QueryEditorContainer(props) {
  const connectionsContext = useContext(ConnectionsContext);

  return (
    <AppNav>
      <QueryEditor
        connections={connectionsContext.connections}
        loadConnections={connectionsContext.loadConnections}
        selectedConnectionId={connectionsContext.selectedConnectionId}
        selectConnection={connectionsContext.selectConnection}
        {...props}
      />
    </AppNav>
  );
}

export default QueryEditorContainer;
