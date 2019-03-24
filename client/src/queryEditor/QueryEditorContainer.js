import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';
import React, { useContext, useState } from 'react';
import AppNav from '../AppNav';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import { ConnectionsContext } from '../connections/ConnectionsStore';
import AppContext from '../containers/AppContext';
import QueryEditor from './QueryEditor';

function QueryEditorContainer(props) {
  const [visible, setVisible] = useState(false);
  const appContext = useContext(AppContext);
  const connectionsContext = useContext(ConnectionsContext);

  return (
    <AppNav
      pageMenuItems={[
        <Menu.Item key="connections-drawer" onClick={() => setVisible(true)}>
          <Icon type="database" />
          <span>DB connections</span>
        </Menu.Item>
      ]}
    >
      <QueryEditor
        connections={connectionsContext.connections}
        loadConnections={connectionsContext.loadConnections}
        selectedConnectionId={connectionsContext.selectedConnectionId}
        selectConnection={connectionsContext.selectConnection}
        {...appContext}
        {...props}
      />
      <ConnectionListDrawer
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </AppNav>
  );
}

export default QueryEditorContainer;
