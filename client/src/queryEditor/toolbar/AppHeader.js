import React from 'react';
import AboutButton from './AboutButton';
import ConnectionAccessButton from './ConnectionAccessButton';
import ConnectionsButton from './ConnectionsButton';
import HistoryButton from './HistoryButton';
import LogoButton from './LogoButton';
import QueryListButton from './QueryListButton';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarSpacer from './ToolbarSpacer';
import UserButton from './UserButton';
import UsersButton from './UsersButton';

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
        <LogoButton />
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
