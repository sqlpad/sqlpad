import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/connections'
import ConnectionEditContainer from '../containers/ConnectionEdit'
import ModalContainer from '../containers/ModalContainer'
import Header from '../common/Header'
import DidMount from '../common/DidMount'
import DocumentTitle from '../common/DocumentTitle'
import ConnectionEditModal from './ConnectionEditModal'
import ConnectionsTable from './ConnectionsTable'
import ConnectionForm from './ConnectionForm'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

const { Content } = Layout

function ConnectionsView() {
  return (
    <Layout
      style={{ minHeight: '100vh' }}
      className="flex w-100 flex-column h-100"
    >
      <DocumentTitle>SQLPad - Connections</DocumentTitle>

      <Header title="Connections">
        <Subscribe to={[ConnectionEditContainer, ModalContainer]}>
          {(editContainer, modalContainer) => (
            <Button
              type="primary"
              onClick={async () => {
                await editContainer.editConnection()
                return modalContainer.show('New connection')
              }}
            >
              New connection
            </Button>
          )}
        </Subscribe>
      </Header>

      <Content className="ma4">
        <div className="bg-white">
          <ConnectionsTable />
        </div>
        <ConnectionEditModal>
          <ConnectionForm />
        </ConnectionEditModal>
      </Content>

      <Subscribe to={[ConnectionsContainer]}>
        {connections => <DidMount>{connections.loadConnections}</DidMount>}
      </Subscribe>
    </Layout>
  )
}

export default ConnectionsView
