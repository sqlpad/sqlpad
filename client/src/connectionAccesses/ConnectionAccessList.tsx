import humanizeDuration from 'humanize-duration';
import React, { useState } from 'react';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Text from '../common/Text';
import { ConnectionAccess } from '../types';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';
import ConnectionAccessCreateDrawer from './ConnectionAccessCreateDrawer';

function ConnectionAccessList() {
  const { currentUser } = useAppContext();
  const [showInactives, setShowInactives] = useState(false);
  const [showAccessCreate, setShowAccessCreate] = useState(false);

  let { data: caData, mutate } = api.useConnectionAccesses(showInactives);
  const connectionAccesses = caData || [];

  const toggleShowInactives = () => {
    setShowInactives(!showInactives);
  };

  const newConnectionAccess = () => {
    setShowAccessCreate(true);
  };

  const expireConnectionAccess = async (connectionAccessId: any) => {
    const json = await api.put(
      `/api/connection-accesses/${connectionAccessId}/expire`,
      {}
    );
    const updated = showInactives
      ? connectionAccesses.map((item: any) => {
          if (item.id === connectionAccessId) {
            return json.data;
          } else {
            return item;
          }
        })
      : connectionAccesses.filter(
          (item: any) => item.id !== connectionAccessId
        );
    mutate(updated);
    if (json.error) {
      return message.error('Expire Failed: ' + json.error.toString());
    }
  };

  const handleCreateDrawerClose = () => {
    setShowAccessCreate(false);
  };

  const handleConnectionAccessSaved = (connectionAccess: ConnectionAccess) => {
    const updated = [connectionAccess].concat(connectionAccesses);
    mutate(updated);
    setShowAccessCreate(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button style={{ marginRight: 8 }} onClick={toggleShowInactives}>
          {showInactives ? 'Hide Expired' : 'Show Expired'}
        </Button>
        <Button
          style={{ width: 135 }}
          variant="primary"
          onClick={newConnectionAccess}
        >
          Create Access
        </Button>
      </div>
      {connectionAccesses.map((item) => {
        const actions = [];
        const timeToExpire = new Date(item.expiryDate).valueOf() - Date.now();
        const expired = timeToExpire < 0;

        if (currentUser?.role === 'admin' && !expired) {
          actions.push(
            <DeleteConfirmButton
              key="expire"
              confirmMessage="Expire connection access?"
              onConfirm={() => {
                expireConnectionAccess(item.id);
              }}
              style={{ marginLeft: 8 }}
            >
              Expire
            </DeleteConfirmButton>
          );
        }

        return (
          <ListItem key={item.id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              <b>Connection:</b> {item.connectionName}
              <br />
              <b>User:</b> {item.userEmail}
              <br />
              <Text type="secondary">
                Duration: {item.duration || 'Indefinite'}{' '}
                {!item.duration || 'seconds'}
                &nbsp;&nbsp; - &nbsp;&nbsp; Expiry Date:{' '}
                {new Date(item.expiryDate).toLocaleString()}
              </Text>
              <br />
              {!expired ? (
                <Text type="secondary">
                  Time to Expire:{' '}
                  {humanizeDuration(timeToExpire, {
                    units: ['d', 'h', 'm'],
                    round: true,
                  })}
                </Text>
              ) : (
                <Text type="danger">Expired</Text>
              )}
            </div>
            {actions}
          </ListItem>
        );
      })}
      <ConnectionAccessCreateDrawer
        visible={showAccessCreate}
        onClose={handleCreateDrawerClose}
        onConnectionAccessSaved={handleConnectionAccessSaved}
        placement="left"
      />
    </>
  );
}

export default ConnectionAccessList;
