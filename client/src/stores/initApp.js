import localforage from 'localforage';
import message from '../common/message';
import { refreshAppContext } from './config';
import fetchJson from '../utilities/fetch-json';
import sortBy from 'lodash/sortBy';

window.localforage = localforage;

function sortConnections(connections) {
  return sortBy(connections, [(connection) => connection.name.toLowerCase()]);
}

const initApp = async (state) => {
  try {
    let [
      selectedConnectionId,
      appContext,
      connectionsResponse,
    ] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
      refreshAppContext(),
      fetchJson('GET', '/api/connections/'),
    ]);

    const connections = sortConnections(connectionsResponse.data || []);

    if (!appContext) {
      appContext = {};
    }

    const update = {
      initialized: true,
      ...appContext,
      connections,
      connectionsLastUpdated: new Date(),
    };

    if (connections.length === 1) {
      update.selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = appContext.config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c) => c._id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          update.selectedConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c) => c._id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
          update.selectedConnectionId = selectedConnectionId;
        }
      }
    }
    return update;
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

export default initApp;
