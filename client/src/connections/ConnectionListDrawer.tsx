import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionList from './ConnectionList';

function ConnectionListDrawer({ visible, onClose }: any) {
  return (
    <Drawer
      title="Connections"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      {/* @ts-expect-error ts-migrate(2322) FIXME: Property 'onClose' does not exist on type 'Intrins... Remove this comment to see the full error message */}
      <ConnectionList onClose={onClose} />
    </Drawer>
  );
}

export default ConnectionListDrawer;
