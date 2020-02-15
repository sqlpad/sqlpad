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
  loadConnections
} from '../stores/connections';
import ConnectionEditDrawer from './ConnectionEditDrawer';

function ConnectionList({
  currentUser,
  loadConnections,
  deleteConnection,
  connections,
  addUpdateConnection,
  selectConnectionId
}) {
  const [connectionId, setConnectionId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const editConnection = connection => {
    setConnectionId(connection._id);
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

  const handleConnectionSaved = connection => {
    addUpdateConnection(connection);
    setConnectionId(null);
    setShowEdit(false);
    // If there was not a connectionId previously passed to edit drawer
    // this is a new connection
    // New connections can be selected and then all the drawer closed
    if (!connectionId) {
      selectConnectionId(connection._id);
    }
  };

  // TODO - server driver implementations should implement functions
  // that get decorated normalized display values
  const decoratedConnections = connections.map(connection => {
    connection.key = connection._id;
    connection.displayDatabase = connection.database;
    connection.displaySchema = '';
    let displayPort = connection.port ? ':' + connection.port : '';

    if (connection.driver === 'hdb') {
      connection.displayDatabase = connection.hanadatabase;
      connection.displaySchema = connection.hanaSchema;
      displayPort = connection.hanaport ? ':' + connection.hanaport : '';
    } else if (connection.driver === 'presto') {
      connection.displayDatabase = connection.prestoCatalog;
      connection.displaySchema = connection.prestoSchema;
    }

    connection.displayHost = (connection.host || '') + displayPort;
    return connection;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button style={{ width: 135 }} type="primary" onClick={newConnection}>
          Add connection
        </Button>
      </div>
      {decoratedConnections.map(item => {
        let description = '';
        if (item.user) {
          description = item.user + '@';
        }
        description += [
          item.displayHost,
          item.displayDatabase,
          item.displaySchema
        ]
          .filter(part => part && part.trim())
          .join(' / ');

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
              onConfirm={e => deleteConnection(item._id)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </DeleteConfirmButton>
          );
        }

        return (
          <ListItem key={item._id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              {item.name}
              <br />
              <Text type="secondary">{description}</Text>
            </div>
            {actions}
          </ListItem>
        );
      })}

      <ConnectionEditDrawer
        connectionId={connectionId}
        visible={showEdit}
        onClose={handleEditDrawerClose}
        onConnectionSaved={handleConnectionSaved}
        placement="right"
      />
    </>
  );
}

export default connect(['connections', 'currentUser'], store => ({
  selectConnectionId,
  deleteConnection,
  addUpdateConnection,
  loadConnections: loadConnections(store)
}))(ConnectionList);
