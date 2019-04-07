import Button from 'antd/lib/button';
import Drawer from 'antd/lib/drawer';
import Icon from 'antd/lib/icon';
import List from 'antd/lib/list';
import Popconfirm from 'antd/lib/popconfirm';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import ConnectionEditDrawer from './ConnectionEditDrawer';

function ConnectionListDrawer({
  currentUser,
  visible,
  onClose,
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
  }, []);

  useEffect(() => {
    if (!showEdit) {
      onClose();
    }
  }, [showEdit]);

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

  // The last "connection" list item will be an input to add a connection
  // This is just something simple to branch off of in List.renderItem prop
  if (currentUser.role === 'admin') {
    decoratedConnections.push('ADD_BUTTON');
  }

  return (
    <Drawer
      title="Connections"
      visible={visible}
      width={600}
      destroyOnClose={true}
      onClose={onClose}
      placement="left"
      style={{
        height: 'calc(100% - 55px)',
        overflow: 'auto'
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={decoratedConnections}
        renderItem={item => {
          if (item === 'ADD_BUTTON') {
            return (
              <List.Item>
                <Button size="large" className="w-100" onClick={newConnection}>
                  <Icon type="plus" /> Add connection
                </Button>
              </List.Item>
            );
          }

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

          if (currentUser.role === 'admin') {
            actions.push(
              <Button onClick={() => editConnection(item)}>edit</Button>
            );
            actions.push(
              <Popconfirm
                title="Delete connection?"
                onConfirm={e => deleteConnection(item._id)}
                onCancel={() => {}}
                okText="Yes"
                cancelText="No"
              >
                <Button icon="delete" type="danger" />
              </Popconfirm>
            );
          }

          return (
            <List.Item actions={actions}>
              <List.Item.Meta
                title={item.name}
                description={
                  <div>
                    {item.driver}
                    <br />
                    {description}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <ConnectionEditDrawer
        connectionId={connectionId}
        visible={showEdit}
        onClose={handleEditDrawerClose}
        onConnectionSaved={handleConnectionSaved}
        placement="left"
      />
    </Drawer>
  );
}

export default connect(
  ['connections', 'currentUser'],
  actions
)(ConnectionListDrawer);
