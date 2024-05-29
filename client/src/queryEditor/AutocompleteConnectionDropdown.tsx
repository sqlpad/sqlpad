import React, { useState } from 'react';
import Select from 'react-select';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import {
  connectConnectionClient,
  selectConnectionId,
} from '../stores/editor-actions';
import { useSessionConnectionId } from '../stores/editor-store';
import { Connection } from '../types';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';
import styles from './AutocompleteConnectionDropdown.module.css';

function AutocompleteConnectionDropdown() {
  const { currentUser } = useAppContext();
  const selectedConnectionId = useSessionConnectionId();
  const [showEdit, setShowEdit] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  let { data: connectionsData, mutate } = api.useConnections();
  const connections = connectionsData || [];

  const options = connections.map((conn) => ({
    value: conn.id,
    label: conn.name,
  }));

  if (currentUser?.role === 'admin') {
    options.push({ value: 'new', label: '... New connection' });
    options.push({ value: 'manage', label: '... Manage connections' });
  }

  const handleChange = (selectedOption: any) => {
    if (selectedOption.value === 'new') {
      return setShowEdit(true);
    }
    if (selectedOption.value === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(selectedOption.value);
    connectConnectionClient();
  };

  const handleConnectionSaved = (connection: Connection) => {
    mutate();
    selectConnectionId(connection.id);
    setShowEdit(false);
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

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      color: !selectedConnectionId ? '#777' : undefined,
      width: 300
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: !selectedConnectionId ? '#777' : undefined,
    }),
  };

  const className = !selectedConnectionId ? styles.attention : undefined;

  return (
    <>
      <Select        
        styles={customStyles}
        className={className}
        value={
          options.find((option) => option.value === selectedConnectionId) ||
          null
        }
        onChange={handleChange}
        options={options}
        placeholder="... choose connection"
      />
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

export default AutocompleteConnectionDropdown;
