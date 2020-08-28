import localforage from 'localforage';
import message from '../common/message';

const queryString = require('query-string');

// @ts-expect-error ts-migrate(2551) FIXME: Property 'localforage' does not exist on type 'Win... Remove this comment to see the full error message
window.localforage = localforage;

const initApp = async (state: any, config: any, connections: any) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    const update = {
      initialized: true,
    };

    if (connections.length === 1) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectedConnectionId' does not exist on ... Remove this comment to see the full error message
      update.selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c: any) => c.id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectedConnectionId' does not exist on ... Remove this comment to see the full error message
          update.selectedConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c: any) => c.id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectedConnectionId' does not exist on ... Remove this comment to see the full error message
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectedConnectionId' does not exist on ... Remove this comment to see the full error message
          update.selectedConnectionId = selectedConnection.id;
      }

      const qsConnectionId = qs.connectionId;
      if (qsConnectionId) {
        const selectedConnection = connections.find(
          (c: any) => c.id === qsConnectionId
        );
        if (Boolean(selectedConnection))
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectedConnectionId' does not exist on ... Remove this comment to see the full error message
          update.selectedConnectionId = selectedConnection.id;
      }
    }
    return update;
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

export default initApp;
