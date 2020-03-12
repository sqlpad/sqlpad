import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import Drawer from '../common/Drawer';
import ConnectionAccessListDrawer from '../connectionAccesses/ConnectionAccessListDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import UserList from '../users/UserList';
import AppHeaderDivider from './AppHeaderDivider';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps)(React.memo(AppHeaderAdminSection));

function AppHeaderAdminSection({ currentUser }) {
  const [showConnections, setShowConnections] = useState(false);
  const [showConnectionAccesses, setShowConnectionAccesses] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  if (currentUser.role !== 'admin') {
    return null;
  }

  let hideButton = false;
  if (currentUser._id === 'noauth') {
    hideButton = true;
  }

  return [
    <AppHeaderDivider key="divider" />,

    <Button
      key="connection-button"
      variant="ghost"
      onClick={() => setShowConnections(true)}
    >
      Connections
    </Button>,

    <ConnectionListDrawer
      key="connection-drawer"
      visible={showConnections}
      onClose={() => setShowConnections(false)}
    />,

    <Button
      key="connection-access-button"
      variant="ghost"
      onClick={() => setShowConnectionAccesses(true)}
    >
      Access
    </Button>,

    <ConnectionAccessListDrawer
      key="connection-access-drawer"
      visible={showConnectionAccesses}
      onClose={() => setShowConnectionAccesses(false)}
    />,

    <Button
      key="user-button"
      variant="ghost"
      onClick={() => setShowUsers(true)}
      hidden={hideButton}
    >
      Users
    </Button>,

    <Drawer
      key="users-drawer"
      title="Users"
      visible={showUsers}
      width={600}
      onClose={() => setShowUsers(false)}
      placement="left"
    >
      <UserList />
    </Drawer>
  ];
}

export default Connected;
