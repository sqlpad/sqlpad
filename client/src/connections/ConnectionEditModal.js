import Drawer from 'antd/lib/drawer'
import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionEditContainer from '../containers/ConnectionEditContainer'
import ConnectionForm from './ConnectionForm'

function ConnectionEditModal({ children }) {
  return (
    <Subscribe to={[ConnectionEditContainer]}>
      {connectionEditContainer => (
        <Drawer
          title={connectionEditContainer.state.title}
          visible={!!connectionEditContainer.state.visible}
          width={600}
          destroyOnClose={true}
          onClose={connectionEditContainer.cancelEdit}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto'
          }}
        >
          <ConnectionForm />
        </Drawer>
      )}
    </Subscribe>
  )
}

export default ConnectionEditModal
