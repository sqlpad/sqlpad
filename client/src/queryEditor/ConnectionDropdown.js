import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Select from '../common/Select';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import {
  addUpdateConnection,
  connectConnectionClient,
  selectConnectionId,
} from '../stores/connections';
import styles from './ConnectionDropdown.module.css';

function ConnectionDropdown({
  addUpdateConnection,
  connectConnectionClient,
  connections,
  currentUser,
  selectConnectionId,
  selectedConnectionId,
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const handleChange = (event) => {
    if (event.target.value === 'new') {
      return setShowEdit(true);
    }
    if (event.target.value === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(event.target.value);
    connectConnectionClient();
  };

  const handleConnectionSaved = (connection) => {
    addUpdateConnection(connection);
    selectConnectionId(connection.id);
    setShowEdit(false);
    connectConnectionClient();
  };

  // Only show the connection menu if there's more than one option to select.
  if (currentUser.role === 'editor' && connections.length === 1) {
    return null;
  }

  const style = !selectedConnectionId
    ? { color: '#777', width: 220 }
    : { width: 220 };

  const className = !selectedConnectionId ? styles.attention : null;

  return (
    <>
      <Select
        style={style}
        className={className}
        value={selectedConnectionId || undefined}
        onChange={handleChange}
      >
        <option value="">... choose connection</option>
        {connections.map((conn) => {
          return (
            <option key={conn.id} value={conn.id} name={conn.name}>
              {conn.name}
            </option>
          );
        })}

        {currentUser.role === 'admin' && (
          <option value="new">... New connection</option>
        )}
        {currentUser.role === 'admin' && (
          <option value="manage">... Manage connections</option>
        )}
      </Select>
      <ConnectionEditDrawer
        visible={showEdit}
        placement="left"
        onClose={() => setShowEdit(false)}
        onConnectionSaved={handleConnectionSaved}
      />
      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />
    </>
  );
}

export default connect(
  ['connections', 'currentUser', 'selectedConnectionId'],
  (store) => ({
    connectConnectionClient: connectConnectionClient(store),
    selectConnectionId,
    addUpdateConnection,
  })
)(ConnectionDropdown);
