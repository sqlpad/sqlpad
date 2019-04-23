import Button from 'antd/lib/button';
import List from 'antd/lib/list';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Popconfirm from 'antd/lib/popconfirm';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
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
      <Row>
        <Col offset={17} span={7}>
          <Button className="w-100" type="primary" onClick={newConnection}>
            Add connection
          </Button>
        </Col>
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={decoratedConnections}
        renderItem={item => {
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
        placement="right"
      />
    </>
  );
}

export default connect(
  ['connections', 'currentUser'],
  actions
)(ConnectionList);
