import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import ConnectionAccessListDrawer from '../../connectionAccesses/ConnectionAccessListDrawer';
import { clearQueries } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps, store => ({
  clearQueries
}))(React.memo(ConnectionAccessButton));

function ConnectionAccessButton({ currentUser, clearQueries }) {
  const [showConnectionAccesses, setShowConnectionAccesses] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => setShowConnectionAccesses(true)}>
        Connection Access
      </Button>
      <ConnectionAccessListDrawer
        visible={showConnectionAccesses}
        onClose={() => setShowConnectionAccesses(false)}
      />
    </div>
  );
}

export default Connected;
