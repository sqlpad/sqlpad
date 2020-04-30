import React from 'react';
import Drawer from '../common/Drawer';
import ConnectionForm from './ConnectionForm';

function ConnectionEditDrawer({
  connectionId,
  visible,
  onClose,
  onConnectionSaved,
  placement,
}) {
  const title = connectionId ? 'Edit connection' : 'New connection';
  return (
    <Drawer
      title={title}
      visible={visible}
      width={560}
      onClose={onClose}
      placement={placement || 'right'}
    >
      <ConnectionForm
        connectionId={connectionId}
        onConnectionSaved={onConnectionSaved}
      />
    </Drawer>
  );
}

export default ConnectionEditDrawer;
