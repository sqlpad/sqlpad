import localforage from 'localforage';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json';

window.localforage = localforage;

const initApp = async (state, config) => {
  try {
    let [selectedConnectionId, connectionsResponse] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
      fetchJson('GET', '/api/connections/'),
    ]);

    const connections = connectionsResponse.data || [];

    const update = {
      initialized: true,
    };

    if (connections.length === 1) {
      update.selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
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
