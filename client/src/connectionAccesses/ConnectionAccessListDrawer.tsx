import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionAccessList from './ConnectionAccessList';

function ConnectionAccessListDrawer({ visible, onClose }: any) {
  return (
    <Drawer
      title="Connection Accesses"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      <ConnectionAccessList />
    </Drawer>
  );
}

export default ConnectionAccessListDrawer;
