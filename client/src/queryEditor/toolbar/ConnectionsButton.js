import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import ConnectionListDrawer from '../../connections/ConnectionListDrawer';
import { clearQueries } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps, store => ({
  clearQueries
}))(React.memo(ConnectionsButton));

function ConnectionsButton({ currentUser, clearQueries }) {
  const [showConnections, setShowConnections] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => setShowConnections(true)}>
        Connections
      </Button>

      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />
    </div>
  );
}

export default Connected;
