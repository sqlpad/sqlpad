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
      {/* @ts-expect-error ts-migrate(2322) FIXME: Property 'onClose' does not exist on type 'Intrins... Remove this comment to see the full error message */}
      <ConnectionAccessList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionAccessListDrawer;
