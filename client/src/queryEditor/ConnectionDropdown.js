import React, { useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import Select from '../common/Select';

function ConnectionDropdown({
  addUpdateConnection,
  connections,
  currentUser,
  selectConnectionId,
  selectedConnectionId
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const handleChange = event => {
    if (event.target.value === 'new') {
      return setShowEdit(true);
    }
    if (event.target.value === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(event.target.value);
  };

  const handleConnectionSaved = connection => {
    addUpdateConnection(connection);
    selectConnectionId(connection._id);
    setShowEdit(false);
  };

  const style = !selectedConnectionId
    ? { color: '#777', width: 260 }
    : { width: 260 };

  return (
    <>
      <Select
        style={style}
        value={selectedConnectionId || undefined}
        onChange={handleChange}
      >
        <option value="">... choose connection</option>
        {connections.map(conn => {
          return (
            <option key={conn._id} value={conn._id} name={conn.name}>
              {conn.name}
            </option>
          );
        })}

        <option value="new">... New connection</option>
        {currentUser.role === 'admin' && (
          <option value="manage">... Manage connections</option>
        )}
      </Select>
      <ConnectionEditDrawer
        visible={showEdit}
        placement="right"
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
  actions
)(ConnectionDropdown);
