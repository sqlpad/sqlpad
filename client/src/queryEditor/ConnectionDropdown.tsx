import React, { useState, ChangeEvent } from 'react';
import Select from '../common/Select';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import {
  connectConnectionClient,
  selectConnectionId,
} from '../stores/editor-actions';
import { useSessionConnectionId } from '../stores/editor-store';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';
import styles from './ConnectionDropdown.module.css';

function ConnectionDropdown() {
  const { currentUser } = useAppContext();
  const selectedConnectionId = useSessionConnectionId();
  const [showConnections, setShowConnections] = useState(false);

  let { data: connectionsData, mutate } = api.useConnections();
  const connections = connectionsData || [];

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(event.target.value);
    connectConnectionClient();
  };

  // Only show the connection menu if there's more than one option to select.
  if (currentUser?.role === 'editor' && connections.length === 1) {
    const name = connections.find((c) => c.id === selectedConnectionId)?.name;
    return (
      <div style={{ height: 32, lineHeight: '32px', padding: '0 8px' }}>
        {name || ''}
      </div>
    );
  }

  const style = !selectedConnectionId
    ? { color: '#777', width: 220 }
    : { width: 220 };

  const className = !selectedConnectionId ? styles.attention : undefined;

  return (
    <>
      <Select
        style={style}
        className={className}
        value={selectedConnectionId || ''}
        onChange={handleChange}
      >
        <option value="" hidden>
          ... choose connection
        </option>
        {connections.map((conn) => {
          return (
            <option key={conn.id} value={conn.id}>
              {conn.name}
            </option>
          );
        })}

        {currentUser?.role === 'admin' && (
          <option value="manage">... Manage connections</option>
        )}
      </Select>
      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />
    </>
  );
}

export default ConnectionDropdown;