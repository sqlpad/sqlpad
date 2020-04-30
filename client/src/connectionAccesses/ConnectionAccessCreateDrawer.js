import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionAccessForm from './ConnectionAccessForm';

function ConnectionAccessCreateDrawer({
  connectionId,
  visible,
  onClose,
  onConnectionAccessSaved,
  placement,
}) {
  return (
    <Drawer
      title="Create Access"
      visible={visible}
      width={520}
      onClose={onClose}
      placement={placement || 'right'}
    >
      <ConnectionAccessForm
        connectionId={connectionId}
        onConnectionAccessSaved={onConnectionAccessSaved}
      />
    </Drawer>
  );
}

export default ConnectionAccessCreateDrawer;
