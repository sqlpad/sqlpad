import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import {
  connectConnectionClient,
  disconnectConnectionClient
} from '../../stores/connections';

function ToolbarConnectionClientButton({
  connectionClient,
  connections,
  selectedConnectionId,
  connectConnectionClient,
  disconnectConnectionClient
}) {
  const [fetching, setFetching] = useState(false);

  async function handleClick() {
    setFetching(true);
    if (connectionClient) {
      await disconnectConnectionClient();
    } else {
      await connectConnectionClient();
    }
    setFetching(false);
  }

  if (!connections || connections.length === 0 || !selectedConnectionId) {
    return null;
  }

  const connection = connections.find(
    connection => connection._id === selectedConnectionId
  );
  if (!connection || !connection.supportsConnectionClient) {
    return null;
  }

  return (
    <Button
      tooltip="Connected keeps a single connection open, auto opens and closes for each query"
      disabled={fetching}
      onClick={handleClick}
    >
      {connectionClient ? 'Connected' : 'Auto'}
    </Button>
  );
}

export default connect(
  ['connectionClient', 'connections', 'selectedConnectionId'],
  store => ({
    connectConnectionClient: connectConnectionClient(store),
    disconnectConnectionClient
  })
)(ToolbarConnectionClientButton);
