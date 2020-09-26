import create from 'zustand';
import message from '../common/message';
import { api } from '../utilities/fetch-json';
import localforage from 'localforage';

type State = {
  initialized: boolean;
  selectedConnectionId: string;
  connectionClient: any;
  connectionClientInterval: any;
};

export const useConnectionsStore = create<State>((set, get) => ({
  initialized: false,
  selectedConnectionId: '',
  connectionClient: null,
  connectionClientInterval: null,
}));

export function useSelectedConnectionId(): string {
  return useConnectionsStore((s) => s.selectedConnectionId);
}

export function useConnectionClient(): any {
  return useConnectionsStore((s) => s.connectionClient);
}

/**
 * Open a connection client for the currently selected connection if supported
 */
export async function connectConnectionClient() {
  const {
    connectionClient,
    selectedConnectionId,
  } = useConnectionsStore.getState();

  // If a connectionClient is already open or selected connection id doesn't exist, do nothing
  if (connectionClient || !selectedConnectionId) {
    return;
  }

  // Regular users are not allowed to get connections by id, but they can get list of connections
  // May want to store selected connection instead of just id
  const { data: connections } = await api.get(`/api/connections`);
  const connection = (connections || []).find(
    (connection: any) => connection.id === selectedConnectionId
  );

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return;
  }

  const json = await api.post('/api/connection-clients', {
    connectionId: selectedConnectionId,
  });
  if (json.error) {
    return message.error('Problem connecting to database');
  }

  // Poll connection-clients api to keep it alive
  const connectionClientInterval = setInterval(async () => {
    const updateJson = await api.put(
      `/api/connection-clients/${json.data.id}`,
      {}
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
      useConnectionsStore.setState({
        connectionClientInterval: null,
        connectionClient: null,
      });
    } else {
      useConnectionsStore.setState({
        connectionClient: updateJson.data,
      });
    }
  }, 10000);

  useConnectionsStore.setState({
    connectionClient: json.data,
    connectionClientInterval,
  });
}

/**
 * Disconnect the current connection client if one exists
 */
export async function disconnectConnectionClient() {
  const {
    connectionClient,
    connectionClientInterval,
  } = useConnectionsStore.getState();

  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  useConnectionsStore.setState({
    connectionClient: null,
    connectionClientInterval: null,
  });
}

/**
 * Select connection and disconnect connectionClient if it exists
 * @param selectedConnectionId
 */
export function selectConnectionId(selectedConnectionId: string) {
  const {
    connectionClient,
    connectionClientInterval,
  } = useConnectionsStore.getState();

  localforage
    .setItem('selectedConnectionId', selectedConnectionId)
    .catch((error) => message.error(error));

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }

  useConnectionsStore.setState({
    selectedConnectionId,
    connectionClient: null,
    connectionClientInterval: null,
  });
}
