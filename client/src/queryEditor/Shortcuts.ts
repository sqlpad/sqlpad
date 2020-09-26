import keymaster from 'keymaster';
import { useEffect } from 'react';
import {
  connectConnectionClient,
  formatQuery,
  runQuery,
  saveQuery,
} from '../stores/editor-actions';

// TODO make this a custom hook. It is only a component because it is old ways
function Shortcuts() {
  useEffect(() => {
    // keymaster doesn't fire on input/textarea events by default
    // since we are only using command/ctrl shortcuts,
    // we want the event to fire all the time for any element
    keymaster.filter = () => true;
    keymaster('ctrl+s, command+s', (e: any) => {
      saveQuery();
      return false;
    });
    keymaster('ctrl+return, command+return', (e: any) => {
      connectConnectionClient().then(() => runQuery());
      return false;
    });
    keymaster('shift+return', (e: any) => {
      formatQuery();
      return false;
    });

    return () => {
      keymaster.unbind('ctrl+return, command+return');
      keymaster.unbind('ctrl+s, command+s');
      keymaster.unbind('shift+return');
    };
  }, []);

  return null;
}

export default Shortcuts;
