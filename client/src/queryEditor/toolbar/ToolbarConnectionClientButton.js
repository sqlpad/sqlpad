import ConnectedIcon from 'mdi-react/ServerNetworkIcon';
import DisconnectedIcon from 'mdi-react/ServerNetworkOffIcon';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
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

  // If no connections or one isn't selected don't render anything
  if (!connections || connections.length === 0 || !selectedConnectionId) {
    return null;
  }

  const connection = connections.find(
    connection => connection.id === selectedConnectionId
  );

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return null;
  }

  return (
    <IconButton
      onClick={handleClick}
      disabled={fetching}
      tooltip={
        connectionClient ? 'Disconnect from database' : 'Connect to database'
      }
    >
      {connectionClient ? <ConnectedIcon /> : <DisconnectedIcon />}
    </IconButton>
  );
}

export default connect(
  ['connectionClient', 'connections', 'selectedConnectionId'],
  store => ({
    connectConnectionClient: connectConnectionClient(store),
    disconnectConnectionClient
  })
)(ToolbarConnectionClientButton);
