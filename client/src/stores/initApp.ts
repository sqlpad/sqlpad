import localforage from 'localforage';
import message from '../common/message';
import { useConnectionsStore } from './connections-store';

const queryString = require('query-string');

// @ts-expect-error
window.localforage = localforage;

const initApp = async (config: any, connections: any) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    const update: { initialized: boolean; selectedConnectionId?: string } = {
      initialized: true,
    };

    if (connections.length === 1) {
      update.selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c: any) => c.id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          update.selectedConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c: any) => c.id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
          update.selectedConnectionId = selectedConnectionId;
        }
      }

      const qs = queryString.parse(window.location.search);
      const qsConnectionName = qs.connectionName;
      if (qsConnectionName) {
        const selectedConnection = connections.find(
          (c: any) => c.name === qsConnectionName
        );
        if (Boolean(selectedConnection))
          update.selectedConnectionId = selectedConnection.id;
      }

      const qsConnectionId = qs.connectionId;
      if (qsConnectionId) {
        const selectedConnection = connections.find(
          (c: any) => c.id === qsConnectionId
        );
        if (Boolean(selectedConnection))
          update.selectedConnectionId = selectedConnection.id;
      }
    }

    useConnectionsStore.setState(update);
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

export default initApp;
