import React, { useState } from 'react';
import useSWR from 'swr';
import Button from '../common/Button';
import HorizontalFormItem from '../common/HorizontalFormItem';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import { api } from '../utilities/fetch-json';

function ConnectionAccessForm({ onConnectionAccessSaved }: any) {
  const [connectionAccessEdits, setConnectionAccessEdits] = useState({});
  const [creating, setCreating] = useState(false);

  let { data: apiConnections } = useSWR('/api/connections');
  const connections = [
    {
      id: '__EVERY_CONNECTION__',
      name: 'Every Connection',
    },
  ].concat(apiConnections || []);

  let { data: apiUsers } = useSWR('/api/users');
  const users = [
    {
      id: '__EVERYONE__',
      email: 'Everyone',
    },
  ].concat(apiUsers || []);

  const setConnectionAccessValue = (key: any, value: any) => {
    setConnectionAccessEdits((prev) => ({ ...prev, [key]: value }));
  };

  const createConnectionAccess = async () => {
    if (creating) {
      return;
    }

    setCreating(true);
    const json = await api.post(
      '/api/connection-accesses',
      connectionAccessEdits
    );
    if (json.error) {
      setCreating(false);
      return message.error(json.error);
    }
    return onConnectionAccessSaved(json.data);
  };

  const {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'connectionId' does not exist on type '{}... Remove this comment to see the full error message
    connectionId = '',
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userId' does not exist on type '{}'.
    userId = '',
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'duration' does not exist on type '{}'.
    duration = '',
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
      // @ts-expect-error ts-migrate(2345) FIXME: Type 'boolean' is not assignable to type 'number'.
      .sort((a, b) => a.name > b.name)
      .forEach((connection) =>
        connectionSelectOptions.push(
          <option key={connection.id} value={connection.id}>
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
      // @ts-expect-error ts-migrate(2345) FIXME: Type 'boolean' is not assignable to type 'number'.
      .sort((a, b) => a.name > b.name)
      .forEach((user) =>
        userSelectOptions.push(
          <option key={user.id} value={user.id}>
            {user.email}
          </option>
        )
      );
  }

  return (
    <div style={{ height: '100%' }}>
      <form
        onSubmit={createConnectionAccess}
        autoComplete="off"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <HorizontalFormItem label="Connection">
          <Select
            name="connectionId"
            value={connectionId}
            error={!connectionId}
            onChange={(event: any) =>
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
            onChange={(event: any) =>
              setConnectionAccessValue('userId', event.target.value)
            }
          >
            {userSelectOptions}
          </Select>
        </HorizontalFormItem>
        <HorizontalFormItem label="Duration in seconds (optional)">
          <Input
            name="duration"
            value={duration}
            onChange={(e: any) =>
              setConnectionAccessValue(e.target.name, e.target.value)
            }
          />
        </HorizontalFormItem>
        <br />
        <div
          style={{
            borderTop: '1px solid #e8e8e8',
            paddingTop: '22px',
            textAlign: 'right',
          }}
        >
          <Button
            htmlType="submit"
            style={{ width: 120 }}
            variant="primary"
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
