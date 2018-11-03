import React from 'react'
import { Subscribe } from 'unstated'
import ModalContainer from '../containers/ModalContainer'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'

function ConnectionEditModal({ children }) {
  return (
    <Subscribe to={[ModalContainer]}>
      {modalContainer => (
        <Modal
          title={modalContainer.state.title}
          visible={!!modalContainer.state.visible}
          footer={null}
          width={'600px'}
          destroyOnClose={true}
          onCancel={modalContainer.close}
        >
          {children}
        </Modal>
      )}
    </Subscribe>
  )
}

export default ConnectionEditModal
