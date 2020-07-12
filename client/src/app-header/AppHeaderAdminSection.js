import React, { useState } from 'react';
import Button from '../common/Button';
import Drawer from '../common/Drawer';
import ConnectionAccessListDrawer from '../connectionAccesses/ConnectionAccessListDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import ServiceTokenListDrawer from '../serviceTokens/ServiceTokenListDrawer';
import UserList from '../users/UserList';
import useAppContext from '../utilities/use-app-context';
import AppHeaderDivider from './AppHeaderDivider';

function AppHeaderAdminSection() {
  const { config, currentUser } = useAppContext();
  const [showConnections, setShowConnections] = useState(false);
  const [showConnectionAccesses, setShowConnectionAccesses] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showServiceTokens, setShowServiceTokens] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  let hideUsersButton = false;
  if (currentUser.id === 'noauth') {
    hideUsersButton = true;
  }
  const showServiceTokensButton = config.showServiceTokensUI;

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
      hidden={hideUsersButton}
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
    </Drawer>,

    <Button
      key="service-tokens-button"
      variant="ghost"
      onClick={() => setShowServiceTokens(true)}
      hidden={!showServiceTokensButton}
    >
      Service Tokens
    </Button>,

    <ServiceTokenListDrawer
      key="service-tokens-drawer"
      visible={showServiceTokens}
      onClose={() => setShowServiceTokens(false)}
    />,
  ];
}

export default React.memo(AppHeaderAdminSection);
