import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import Text from '../common/Text';
import {
  selectConnectionId,
  deleteConnection,
  addUpdateConnection,
  loadConnections,
} from '../stores/connections';
import ConnectionEditDrawer from './ConnectionEditDrawer';

function ConnectionList({
  currentUser,
  loadConnections,
  deleteConnection,
  connections,
  addUpdateConnection,
  selectConnectionId,
}) {
  const [connectionId, setConnectionId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const editConnection = (connection) => {
    setConnectionId(connection.id);
    setShowEdit(true);
  };

  const newConnection = () => {
    setConnectionId(null);
    setShowEdit(true);
  };

  const handleEditDrawerClose = () => {
    setConnectionId(null);
    setShowEdit(false);
  };

  const handleConnectionSaved = (connection) => {
    addUpdateConnection(connection);
    setConnectionId(null);
    setShowEdit(false);
    // If there was not a connectionId previously passed to edit drawer
    // this is a new connection
    // New connections can be selected and then all the drawer closed
    if (!connectionId) {
      selectConnectionId(connection.id);
    }
  };

  const listItems = connections.map((item) => {
    const actions = [];

    if (currentUser.role === 'admin' && item.editable) {
      actions.push(
        <Button
          key="edit"
          style={{ marginLeft: 8 }}
          onClick={() => editConnection(item)}
        >
          edit
        </Button>
      );
      actions.push(
        <DeleteConfirmButton
          key="delete"
          confirmMessage="Delete connection?"
          onConfirm={(e) => deleteConnection(item.id)}
          style={{ marginLeft: 8 }}
        >
          Delete
        </DeleteConfirmButton>
      );
    }

    return (
      <ListItem key={item.id}>
        <div style={{ flexGrow: 1, padding: 8 }}>
          <span style={{ width: 300, display: 'inline-block', marginRight: 8 }}>
            {item.name}
          </span>
          <Text type="secondary">{item.driver}</Text>
        </div>
        {actions}
      </ListItem>
    );
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          style={{ width: 135 }}
          variant="primary"
          onClick={newConnection}
        >
          Add connection
        </Button>
      </div>
      <div style={{ flexGrow: 1 }}>{listItems}</div>
      <ConnectionEditDrawer
        connectionId={connectionId}
        visible={showEdit}
        onClose={handleEditDrawerClose}
        onConnectionSaved={handleConnectionSaved}
        placement="left"
      />
    </div>
  );
}

export default connect(['connections', 'currentUser'], (store) => ({
  selectConnectionId,
  deleteConnection,
  addUpdateConnection,
  loadConnections: loadConnections(store),
}))(ConnectionList);
