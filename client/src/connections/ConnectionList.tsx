import React, { useState } from 'react';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Text from '../common/Text';
import {
  selectConnectionId,
  setAsynchronousDriver,
} from '../stores/editor-actions';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';
import ConnectionEditDrawer from './ConnectionEditDrawer';

function ConnectionList() {
  const { data: connectionsData, mutate } = api.useConnections();
  let connections = connectionsData || [];

  const deleteConnection = async (connectionId: string) => {
    const json = await api.deleteConnection(connectionId);
    mutate();
    if (json.error) {
      return message.error('Delete failed');
    }
  };

  const { currentUser } = useAppContext();
  const [connectionId, setConnectionId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const editConnection = (connection: any) => {
    setConnectionId(connection.id);
    setShowEdit(true);
  };

  const newConnection = () => {
    setConnectionId(null);
    setAsynchronousDriver(false);
    setShowEdit(true);
  };

  const handleEditDrawerClose = () => {
    setConnectionId(null);
    setShowEdit(false);
  };

  const handleConnectionSaved = (connection: any) => {
    setConnectionId(null);
    setShowEdit(false);
    // If there was not a connectionId previously passed to edit drawer
    // this is a new connection
    // New connections can be selected and then all the drawer closed
    if (!connectionId) {
      selectConnectionId(connection.id);
    }
  };

  const listItems = connections.map((item: any) => {
    const actions = [];

    if (currentUser?.role === 'admin' && item.editable) {
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
          onConfirm={() => {
            deleteConnection(item.id);
          }}
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

export default ConnectionList;
