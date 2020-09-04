import React, { useState } from 'react';
import useSWR from 'swr';
import { connect } from 'unistore/react';
import Select from '../common/Select';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import {
  connectConnectionClient,
  selectConnectionId,
} from '../stores/connections';
import useAppContext from '../utilities/use-app-context';
import styles from './ConnectionDropdown.module.css';

function ConnectionDropdown({
  connectConnectionClient,
  selectConnectionId,
  selectedConnectionId,
}: any) {
  const { currentUser } = useAppContext();
  const [showEdit, setShowEdit] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  let { data: connectionsData, mutate } = useSWR('/api/connections');
  const connections = connectionsData || [];

  const handleChange = (event: any) => {
    if (event.target.value === 'new') {
      return setShowEdit(true);
    }
    if (event.target.value === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(event.target.value);
    connectConnectionClient();
  };

  const handleConnectionSaved = (connection: any) => {
    mutate();
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

  const className = !selectedConnectionId ? styles.attention : undefined;

  return (
    <>
      <Select
        style={style}
        className={className}
        value={selectedConnectionId || undefined}
        onChange={handleChange}
      >
        <option value="">... choose connection</option>
        {connections.map((conn: any) => {
          return (
            // @ts-expect-error ts-migrate(2322) FIXME: Property 'name' does not exist on type 'DetailedHT... Remove this comment to see the full error message
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

export default connect(['selectedConnectionId'], (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  selectConnectionId,
}))(ConnectionDropdown);
