import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionAccessList from './ConnectionAccessList';

function ConnectionAccessListDrawer({ visible, onClose }) {
  return (
    <Drawer
      title="Connection Accesses"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="right"
    >
      <ConnectionAccessList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionAccessListDrawer;
