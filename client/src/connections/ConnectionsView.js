import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import ConnectionEditContainer from '../containers/ConnectionEditContainer'
import Header from '../common/Header'
import DidMount from '../common/DidMount'
import DocumentTitle from '../common/DocumentTitle'
import ConnectionEditModal from './ConnectionEditModal'
import ConnectionsTable from './ConnectionsTable'

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
        <Subscribe to={[ConnectionEditContainer]}>
          {connectionEditContainer => (
            <Button
              type="primary"
              onClick={() => connectionEditContainer.editConnection({})}
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
        <ConnectionEditModal />
      </Content>

      <Subscribe to={[ConnectionsContainer]}>
        {connectionsContainer => (
          <DidMount>{connectionsContainer.loadConnections}</DidMount>
        )}
      </Subscribe>
    </Layout>
  )
}

export default ConnectionsView
