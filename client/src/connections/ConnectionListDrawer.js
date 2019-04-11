import Drawer from 'antd/lib/drawer';
import React from 'react';
import ConnectionList from './ConnectionList';

function ConnectionListDrawer({ visible, onClose }) {
  return (
    <Drawer
      title="Connections"
      visible={visible}
      width={600}
      destroyOnClose={true}
      onClose={onClose}
      placement="right"
      style={{
        height: 'calc(100% - 55px)',
        overflow: 'auto'
      }}
    >
      <ConnectionList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionListDrawer;
