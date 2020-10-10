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
  const showServiceTokensButton = config?.showServiceTokensUI;

  return (
    <>
      <AppHeaderDivider />
      <Button variant="ghost" onClick={() => setShowConnections(true)}>
        Connections
      </Button>
      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />
      <Button variant="ghost" onClick={() => setShowConnectionAccesses(true)}>
        Access
      </Button>
      <ConnectionAccessListDrawer
        visible={showConnectionAccesses}
        onClose={() => setShowConnectionAccesses(false)}
      />
      <Button
        variant="ghost"
        onClick={() => setShowUsers(true)}
        hidden={hideUsersButton}
      >
        Users
      </Button>
      <Drawer
        title="Users"
        visible={showUsers}
        width={600}
        onClose={() => setShowUsers(false)}
        placement="left"
      >
        <UserList />
      </Drawer>
      <Button
        variant="ghost"
        onClick={() => setShowServiceTokens(true)}
        hidden={!showServiceTokensButton}
      >
        Service Tokens
      </Button>
      <ServiceTokenListDrawer
        visible={showServiceTokens}
        onClose={() => setShowServiceTokens(false)}
      />
    </>
  );
}

export default React.memo(AppHeaderAdminSection);
