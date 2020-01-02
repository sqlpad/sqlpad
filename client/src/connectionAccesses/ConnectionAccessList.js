import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import humanizeDuration from 'humanize-duration';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import Text from '../common/Text';
import fetchJson from '../utilities/fetch-json';
import message from '../common/message';
import ConnectionAccessCreateDrawer from './ConnectionAccessCreateDrawer';

function ConnectionAccessList({ currentUser }) {
  const [connectionAccesses, setConnectionAccesses] = useState([]);
  const [showInactives, setShowInactives] = useState(false);
  const [expiredConnectionAccessId, setExpiredConnectionAccessId] = useState(
    null
  );
  const [newConnectionAccessId, setNewConnectionAccessId] = useState(null);
  const [showAccessCreate, setShowAccessCreate] = useState(false);

  useEffect(() => {
    async function getConnectionAccesses() {
      let url = `/api/connection-accesses`;
      if (showInactives) {
        url = url + '?includeInactives=true';
      }
      const json = await fetchJson('GET', url);
      if (json.error) {
        message.error(json.error);
      } else {
        setConnectionAccesses(json.connectionAccesses);
      }
    }

    getConnectionAccesses();
  }, [showInactives, newConnectionAccessId, expiredConnectionAccessId]);

  const toggleShowInactives = () => {
    setShowInactives(!showInactives);
  };

  const newConnectionAccess = () => {
    setShowAccessCreate(true);
  };

  const expireConnectionAccess = async connectionAccessId => {
    const json = await fetchJson(
      'PUT',
      `/api/connection-accesses/${connectionAccessId}/expire`
    );
    if (json.error) {
      return message.error('Expire Failed: ' + json.error.toString());
    }
    setExpiredConnectionAccessId(connectionAccessId);
  };

  const handleCreateDrawerClose = () => {
    setShowAccessCreate(false);
  };

  const handleConnectionAccessSaved = connectionAccess => {
    setShowAccessCreate(false);
    setNewConnectionAccessId(connectionAccess._id);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button style={{ marginRight: 8 }} onClick={toggleShowInactives}>
          {showInactives ? 'Hide Expired' : 'Show Expired'}
        </Button>
        <Button
          style={{ width: 135 }}
          type="primary"
          onClick={newConnectionAccess}
        >
          Create Access
        </Button>
      </div>
      {connectionAccesses.map(item => {
        const actions = [];
        const timeToExpire = new Date(item.expiryDate) - new Date();
        const expired = timeToExpire < 0;

        if (currentUser.role === 'admin' && !expired) {
          actions.push(
            <DeleteConfirmButton
              key="expire"
              confirmMessage="Expire connection access?"
              onConfirm={e => expireConnectionAccess(item._id)}
              style={{ marginLeft: 8 }}
            >
              Expire
            </DeleteConfirmButton>
          );
        }

        return (
          <ListItem key={item._id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              <b>Connection:</b> {item.connectionName}
              <br />
              <b>User:</b> {item.userEmail}
              <br />
              <Text type="secondary">
                Duration: {item.duration || 'Indefinete'}{' '}
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
                    round: true
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
        placement="right"
      />
    </>
  );
}

export default connect(['currentUser'])(ConnectionAccessList);
