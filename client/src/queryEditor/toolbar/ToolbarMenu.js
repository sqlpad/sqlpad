import { MenuItem } from '@reach/menu-button';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import Drawer from '../../common/Drawer';
import IconMenu from '../../common/IconMenu';
import ConnectionAccessListDrawer from '../../connectionAccesses/ConnectionAccessListDrawer';
import ConnectionListDrawer from '../../connections/ConnectionListDrawer';
import QueryHistoryModal from '../../queryHistory/QueryHistoryModal';
import UserList from '../../users/UserList';
import fetchJson from '../../utilities/fetch-json.js';
import AboutModal from './AboutModal';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const ConnectedToolbarMenu = connect(mapStateToProps)(React.memo(ToolbarMenu));

function ToolbarMenu({ currentUser }) {
  const [showUsers, setShowUsers] = useState(false);
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [showQueryHistory, setShowQueryHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showConnectionAccesses, setShowConnectionAccesses] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  if (redirectToSignIn) {
    return <Redirect push to="/signin" />;
  }

  // Reach UI menu / IconMenu does not like the {someBoolean && <element/>} patterm
  // As a workaround optional MenuItems are managed in an array
  let menuItems = [];
  if (isAdmin) {
    menuItems = [
      <MenuItem key="connections" onSelect={() => setShowConnections(true)}>
        Connections
      </MenuItem>,
      <MenuItem key="users" onSelect={() => setShowUsers(true)}>
        Users
      </MenuItem>,
      <MenuItem
        key="connectionAccessess"
        style={{ borderBottom: '1px solid #ddd' }}
        onSelect={() => setShowConnectionAccesses(true)}
      >
        Connection Accesses
      </MenuItem>
    ];
  }

  return (
    <div>
      <IconMenu icon={<DotsVerticalIcon aria-label="menu" />}>
        {menuItems}
        <MenuItem
          key="queryHistory"
          style={{ borderBottom: '1px solid #ddd' }}
          onSelect={() => setShowQueryHistory(true)}
        >
          Query History
        </MenuItem>
        <MenuItem
          style={{ borderBottom: '1px solid #ddd' }}
          onSelect={() => setShowAbout(true)}
        >
          About
        </MenuItem>
        <MenuItem
          onSelect={async () => {
            await fetchJson('GET', '/api/signout');
            setRedirectToSignIn(true);
          }}
        >
          Sign out
        </MenuItem>
      </IconMenu>

      <Drawer
        title={'Users'}
        visible={showUsers}
        width={600}
        onClose={() => setShowUsers(false)}
        placement={'right'}
      >
        <UserList />
      </Drawer>

      <QueryHistoryModal
        visible={showQueryHistory}
        onClose={() => setShowQueryHistory(false)}
      />

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />

      <ConnectionAccessListDrawer
        visible={showConnectionAccesses}
        onClose={() => setShowConnectionAccesses(false)}
      />
    </div>
  );
}

export default ConnectedToolbarMenu;
