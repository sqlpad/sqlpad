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
  connectionClientInterval: null,
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
 * Open a connection client for the currently selected connection if supported
 * @param {*} state
 */
export const connectConnectionClient = store => async state => {
  const { connectionClient, connections, selectedConnectionId } = state;

  // If a connectionClient is already open, or connections or selected connection id doesn't exist, do nothing
  if (connectionClient || !connections || !selectedConnectionId) {
    return;
  }

  const connection = connections.find(
    connection => connection._id === selectedConnectionId
  );

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return;
  }

  const json = await fetchJson('POST', '/api/connection-clients', {
    connectionId: selectedConnectionId
  });
  if (json.error) {
    return message.error('Problem connecting to database');
  }

  // Poll connection-clients api to keep it alive
  const connectionClientInterval = setInterval(async () => {
    const updateJson = await fetchJson(
      'PUT',
      `/api/connection-clients/${json.data.id}`
    );

    // Not sure if this should message user here
    // In the event of an error this could get really noisy
    if (updateJson.error) {
      message.error(updateJson.error);
    }

    // If the PUT didn't return a connectionClient object,
    // the connectionClient has been disconnected
    if (!updateJson.data && connectionClientInterval) {
      clearInterval(connectionClientInterval);
      store.setState({
        connectionClientInterval: null,
        connectionClient: null
      });
    } else {
      store.setState({
        connectionClient: updateJson.data
      });
    }
  }, 10000);

  return { connectionClient: json.data, connectionClientInterval };
};

/**
 * Disconnect the current connection client if one exists
 * @param {*} state
 */
export const disconnectConnectionClient = async state => {
  const { connectionClient, connectionClientInterval } = state;
  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }
  if (connectionClient) {
    fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`).then(
      json => {
        if (json.error) {
          message.error(json.error);
        }
      }
    );
  }
  return { connectionClient: null, connectionClientInterval: null };
};

/**
 * Select connection and disconnect connectionClient if it exists
 * @param {*} state
 * @param {*} selectedConnectionId
 */
export const selectConnectionId = (state, selectedConnectionId) => {
  const { connectionClient, connectionClientInterval } = state;
  localforage
    .setItem('selectedConnectionId', selectedConnectionId)
    .catch(error => message.error(error));

  if (connectionClient) {
    fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`).then(
      json => {
        if (json.error) {
          message.error(json.error);
        }
      }
    );
  }

  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }

  return {
    selectedConnectionId,
    connectionClient: null,
    connectionClientInterval: null
  };
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
    const json = await fetchJson('GET', '/api/connections/');
    if (json.error) {
      message.error(json.error);
    }
    const update = {
      connectionsLoading: false,
      connectionsLastUpdated: new Date(),
      connections: sortConnections(json.data)
    };

    if (json.data && json.data.length === 1) {
      update.selectedConnectionId = json.data[0]._id;
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
