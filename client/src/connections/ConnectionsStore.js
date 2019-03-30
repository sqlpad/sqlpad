import message from 'antd/lib/message';
import sortBy from 'lodash.sortby';
import React, { useState } from 'react';
import fetchJson from '../utilities/fetch-json.js';

const ONE_HOUR_MS = 1000 * 60 * 60;

const sortFunctions = [connection => connection.name.toLowerCase()];

export const ConnectionsContext = React.createContext({});

export function ContextStateStore({ children }) {
  const state = useState({});
  return (
    <ConnectionsContext.Provider value={state}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function ConnectionsStore({ children }) {
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  const selectConnection = id => setSelectedConnectionId(id);

  const _setConnections = connections =>
    setConnections(sortBy(connections, sortFunctions));

  const deleteConnection = async connectionId => {
    const json = await fetchJson('DELETE', '/api/connections/' + connectionId);
    // TODO should errors be messaged like this or should they be captured in state?
    if (json.error) {
      return message.error('Delete failed');
    }
    return setConnections(connections.filter(c => c._id !== connectionId));
  };

  // Updates store (is not resonponsible for API call)
  const addUpdateConnection = async connection => {
    const found = connections.find(c => c._id === connection._id);
    if (found) {
      const mappedConnections = connections.map(c => {
        if (c._id === connection._id) {
          return connection;
        }
        return c;
      });
      return setConnections(mappedConnections);
    }
    return setConnections([connection].concat(connections));
  };

  const loadConnections = async force => {
    if (loading) {
      return;
    }

    if (
      force ||
      !connections.length ||
      (lastUpdated && new Date() - lastUpdated > ONE_HOUR_MS)
    ) {
      setLoading(true);
      const { error, connections } = await fetchJson(
        'GET',
        '/api/connections/'
      );
      if (error) {
        message.error(error);
        setLoadingError(error);
      }

      if (connections && connections.length === 1) {
        setSelectedConnectionId(connections[0]._id);
      }

      setConnections(connections);
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const value = {
    selectedConnectionId,
    loadingError,
    connections,
    loading,
    lastUpdated,
    selectConnection,
    setConnections: _setConnections,
    deleteConnection,
    addUpdateConnection,
    loadConnections
  };

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export default ConnectionsStore;
