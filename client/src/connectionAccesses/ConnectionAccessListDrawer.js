import React from 'react';
import Drawer from '../common/Drawer.tsx';
import ConnectionAccessList from './ConnectionAccessList';

function ConnectionAccessListDrawer({ visible, onClose }) {
  return (
    <Drawer
      title="Connection Accesses"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      <ConnectionAccessList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionAccessListDrawer;
