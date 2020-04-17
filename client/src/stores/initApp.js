import localforage from 'localforage';
import message from '../common/message';
import { refreshAppContext } from './config';

export default async function initApp() {
  try {
    const [showSchema, selectedConnectionId, appContext] = await Promise.all([
      localforage.getItem('showSchema'),
      localforage.getItem('selectedConnectionId'),
      refreshAppContext()
    ]);

    const update = appContext || {};

    if (typeof selectedConnectionId === 'string') {
      update.selectedConnectionId = selectedConnectionId;
    }

    if (typeof showSchema === 'boolean') {
      update.showSchema = showSchema;
    }

    return update;
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
}
