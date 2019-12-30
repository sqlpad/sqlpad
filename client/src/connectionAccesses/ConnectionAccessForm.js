import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import HorizontalFormItem from '../common/HorizontalFormItem.js';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import fetchJson from '../utilities/fetch-json.js';

function ConnectionAccessForm({ onConnectionAccessSaved }) {
  const [connectionAccessEdits, setConnectionAccessEdits] = useState({});
  const [connections, setConnections] = useState([]);
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);

  async function getConnections() {
    const json = await fetchJson('GET', '/api/connections');
    if (json.error) {
      message.error(json.error);
    } else {
      setConnections(json.connections);
    }
  }

  useEffect(() => {
    getConnections();
  }, []);

  async function getUsers() {
    const json = await fetchJson('GET', '/api/users');
    if (json.error) {
      message.error(json.error);
    } else {
      setUsers(json.users);
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  const setConnectionAccessValue = (key, value) => {
    setConnectionAccessEdits(prev => ({ ...prev, [key]: value }));
  };

  const createConnectionAccess = async () => {
    if (creating) {
      return;
    }

    setCreating(true);
    const json = await fetchJson(
      'POST',
      '/api/connection-accesses',
      connectionAccessEdits
    );
    if (json.error) {
      setCreating(false);
      return message.error(json.error);
    }
    return onConnectionAccessSaved(json.connectionAccess);
  };

  const {
    connectionId = '',
    userId = '',
    duration = ''
  } = connectionAccessEdits;

  const connectionSelectOptions = [<option key="none" value="" />];

  if (!connections.length) {
    connectionSelectOptions.push(
      <option key="loading" value="">
        Loading...
      </option>
    );
  } else {
    connections
      .sort((a, b) => a.name > b.name)
      .forEach(connection =>
        connectionSelectOptions.push(
          <option key={connection._id} value={connection._id}>
            {connection.name}
          </option>
        )
      );
  }

  const userSelectOptions = [<option key="none" value="" />];

  if (!users.length) {
    userSelectOptions.push(
      <option key="loading" value="">
        Loading...
      </option>
    );
  } else {
    users
      .sort((a, b) => a.name > b.name)
      .forEach(user =>
        userSelectOptions.push(
          <option key={user._id} value={user._id}>
            {user.email}
          </option>
        )
      );
  }

  return (
    <div style={{ height: '100%' }}>
      <form
        autoComplete="off"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <HorizontalFormItem label="Connection">
          <Select
            name="connectionId"
            value={connectionId}
            error={!connectionId}
            onChange={event =>
              setConnectionAccessValue('connectionId', event.target.value)
            }
          >
            {connectionSelectOptions}
          </Select>
        </HorizontalFormItem>
        <HorizontalFormItem label="User">
          <Select
            name="userId"
            value={userId}
            error={!userId}
            onChange={event =>
              setConnectionAccessValue('userId', event.target.value)
            }
          >
            {userSelectOptions}
          </Select>
        </HorizontalFormItem>
        <HorizontalFormItem label="Duration (seconds)">
          <Input
            name="duration"
            value={duration}
            onChange={e =>
              setConnectionAccessValue(e.target.name, e.target.value)
            }
          />
        </HorizontalFormItem>
        <br />
        <div
          style={{
            borderTop: '1px solid #e8e8e8',
            paddingTop: '22px',
            textAlign: 'right'
          }}
        >
          <Button
            style={{ width: 120 }}
            type="primary"
            onClick={createConnectionAccess}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>{' '}
        </div>
      </form>
    </div>
  );
}

export default ConnectionAccessForm;
