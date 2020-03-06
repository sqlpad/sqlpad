import React from 'react';
import QueryListButton from './QueryListButton';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarSpacer from './ToolbarSpacer';
import ConnectionsButton from './ConnectionsButton';
import UsersButton from './UsersButton';
import ConnectionAccessButton from './ConnectionAccessButton';
import HistoryButton from './HistoryButton';
import AboutButton from './AboutButton';
import UserButton from './UserButton';

function Appheader() {
  return (
    <div
      style={{
        width: '100%',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.84)',
        padding: 6,
        borderBottom: '1px solid rgb(204, 204, 204)'
      }}
    >
      <div style={{ display: 'flex' }}>
        <QueryListButton />
        <ToolbarNewQueryButton />
        <ConnectionsButton />
        <UsersButton />
        <ConnectionAccessButton />
        <HistoryButton />

        <ToolbarSpacer grow />
        <AboutButton />
        <UserButton />
      </div>
    </div>
  );
}

export default React.memo(Appheader);
