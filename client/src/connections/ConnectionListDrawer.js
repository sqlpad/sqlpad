import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionList from './ConnectionList';

function ConnectionListDrawer({ visible, onClose }) {
  return (
    <Drawer
      title="Connections"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      <ConnectionList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionListDrawer;
