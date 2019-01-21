import Drawer from 'antd/lib/drawer'
import React from 'react'
import ConnectionForm from './ConnectionForm'

function ConnectionEditDrawer({
  connectionId,
  visible,
  onClose,
  onConnectionSaved,
  placement
}) {
  const title = connectionId ? 'Edit connection' : 'New connection'
  return (
    <Drawer
      title={title}
      visible={visible}
      width={600}
      destroyOnClose={true}
      onClose={onClose}
      placement={placement || 'right'}
      style={{
        height: 'calc(100% - 55px)',
        overflow: 'auto'
      }}
    >
      <ConnectionForm
        connectionId={connectionId}
        onConnectionSaved={onConnectionSaved}
      />
    </Drawer>
  )
}

export default ConnectionEditDrawer
