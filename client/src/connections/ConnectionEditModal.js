import Modal from 'antd/lib/modal'
import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionEditContainer from '../containers/ConnectionEditContainer'
import ConnectionForm from './ConnectionForm'

function ConnectionEditModal({ children }) {
  return (
    <Subscribe to={[ConnectionEditContainer]}>
      {connectionEditContainer => (
        <Modal
          title={connectionEditContainer.state.title}
          visible={!!connectionEditContainer.state.visible}
          footer={null}
          width={'600px'}
          destroyOnClose={true}
          onCancel={connectionEditContainer.cancelEdit}
        >
          <ConnectionForm />
        </Modal>
      )}
    </Subscribe>
  )
}

export default ConnectionEditModal
