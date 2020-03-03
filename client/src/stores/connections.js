import localforage from 'localforage';
import sortBy from 'lodash/sortBy';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';

const ONE_HOUR_MS = 1000 * 60 * 60;

function sortConnections(connections) {
  return sortBy(connections, [connection => connection.name.toLowerCase()]);
}

export const initialState = {
  selectedConnectionId: '',
  connectionClient: null,
  connections: [],
  connectionsLastUpdated: null,
  connectionsLoading: false
};

export async function initSelectedConnection(state) {
  const selectedConnectionId = await localforage.getItem(
    'selectedConnectionId'
  );
  if (typeof selectedConnectionId === 'string') {
    return {
      selectedConnectionId
    };
  }
}

/**
 * Open a client connection for the currently selected connection
 * @param {*} state
 */
export const connectConnectionClient = async state => {
  const { selectedConnectionId } = state;
  const json = await fetchJson('POST', '/api/connection-clients', {
    connectionId: selectedConnectionId
  });
  if (json.error) {
    return message.error('Problem connecting to database');
  }
  return { connectionClient: json.connectionClient };
};

/**
 * Disconnect the current connection client if one exists
 * @param {*} state
 */
export const disconnectConnectionClient = async state => {
  const { connectionClient } = state;
  if (!connectionClient) {
    return;
  }
  await fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`);
  return { connectionClient: null };
};

/**
 * Select connection and disconnect connectionClient if it exists
 * @param {*} state
 * @param {*} selectedConnectionId
 */
export const selectConnectionId = (state, selectedConnectionId) => {
  const { connectionClient } = state;
  localforage
    .setItem('selectedConnectionId', selectedConnectionId)
    .catch(error => message.error(error));

  if (connectionClient) {
    fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`).catch(
      json => {
        if (json.error) {
          message.error(json.error);
        }
      }
    );
  }

  return { selectedConnectionId, connectionClient: null };
};

export const deleteConnection = async (state, connectionId) => {
  const { connections } = state;
  const json = await fetchJson('DELETE', '/api/connections/' + connectionId);
  if (json.error) {
    return message.error('Delete failed');
  }
  const filtered = connections.filter(c => c._id !== connectionId);
  return { connections: sortConnections(filtered) };
};

// Updates store (is not resonponsible for API call)
export const addUpdateConnection = async (state, connection) => {
  const { connections } = state;
  const found = connections.find(c => c._id === connection._id);
  if (found) {
    const mappedConnections = connections.map(c => {
      if (c._id === connection._id) {
        return connection;
      }
      return c;
    });
    return { connections: sortConnections(mappedConnections) };
  }
  return { connections: sortConnections([connection].concat(connections)) };
};

export const loadConnections = store => async (state, force) => {
  const { connections, connectionsLoading, connectionsLastUpdated } = state;
  if (connectionsLoading) {
    return;
  }

  if (
    force ||
    !connections.length ||
    (connectionsLastUpdated &&
      new Date() - connectionsLastUpdated > ONE_HOUR_MS)
  ) {
    store.setState({ connectionsLoading: true });
    const { error, connections } = await fetchJson('GET', '/api/connections/');
    if (error) {
      message.error(error);
    }
    const update = {
      connectionsLoading: false,
      connectionsLastUpdated: new Date(),
      connections: sortConnections(connections)
    };

    if (connections && connections.length === 1) {
      update.selectedConnectionId = connections[0]._id;
    }

    store.setState(update);
  }
};

export default {
  initialState,
  selectConnectionId,
  deleteConnection,
  addUpdateConnection,
  loadConnections
};
