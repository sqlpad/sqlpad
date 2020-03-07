import React from 'react';
import AppHeaderAdminSection from './AppHeaderAdminSection';
import AppMenu from './AppMenu';
import HistoryButton from './HistoryButton';
import Logo from './Logo';
import QueryListButton from './QueryListButton';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import AppHeaderSpacer from './AppHeaderSpacer';
import AppHeaderUser from './AppHeaderUser';

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
        <Logo />
        <QueryListButton />
        <ToolbarNewQueryButton />
        <HistoryButton />
        <AppHeaderAdminSection />
        <AppHeaderSpacer grow />
        <AppHeaderUser />
        <AppMenu />
      </div>
    </div>
  );
}

export default React.memo(Appheader);
