import keymaster from 'keymaster';
import { useEffect } from 'react';
import { connect } from 'unistore/react';
import { connectConnectionClient } from '../stores/connections';
import { formatQuery, runQuery, saveQuery } from '../stores/queries';

function Shortcuts({
  connectConnectionClient,
  formatQuery,
  runQuery,
  saveQuery,
}: any) {
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
  }, [saveQuery, runQuery, connectConnectionClient, formatQuery]);

  return null;
}

// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
export default connect(null, (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  formatQuery,
  runQuery: runQuery(store),
  saveQuery: saveQuery(store),
}))(Shortcuts);
