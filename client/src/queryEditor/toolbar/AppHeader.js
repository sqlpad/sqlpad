import React from 'react';
import QueryListButton from './QueryListButton';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarSpacer from './ToolbarSpacer';

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

        <ToolbarSpacer grow />

        <ToolbarMenu />
      </div>
    </div>
  );
}

export default React.memo(Appheader);
