import localforage from 'localforage';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';

export const initialState = {
  selectedConnectionId: '',
  connectionClient: null,
  connectionClientInterval: null,
};

/**
 * Open a connection client for the currently selected connection if supported
 * @param {*} state
 */
export const connectConnectionClient = (store) => async (state) => {
  const { connectionClient, selectedConnectionId } = state;

  // If a connectionClient is already open or selected connection id doesn't exist, do nothing
  if (connectionClient || !selectedConnectionId) {
    return;
  }

  // Regular users are not allowed to get connections by id, but they can get list of connections
  // May want to store selected connection instead of just id
  const { data: connections } = await fetchJson('GET', `/api/connections`);
  const connection = (connections || []).find(
    (connection) => connection.id === selectedConnectionId
  );

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return;
  }

  const json = await fetchJson('POST', '/api/connection-clients', {
    connectionId: selectedConnectionId,
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
        connectionClient: null,
      });
    } else {
      store.setState({
        connectionClient: updateJson.data,
      });
    }
  }, 10000);

  return { connectionClient: json.data, connectionClientInterval };
};

/**
 * Disconnect the current connection client if one exists
 * @param {*} state
 */
export const disconnectConnectionClient = async (state) => {
  const { connectionClient, connectionClientInterval } = state;
  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }
  if (connectionClient) {
    fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`).then(
      (json) => {
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
    .catch((error) => message.error(error));

  if (connectionClient) {
    fetchJson('DELETE', `/api/connection-clients/${connectionClient.id}`).then(
      (json) => {
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
    connectionClientInterval: null,
  };
};

export default {
  initialState,
  selectConnectionId,
};
