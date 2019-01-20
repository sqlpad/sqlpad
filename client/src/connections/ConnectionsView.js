import Button from 'antd/lib/button'
import Layout from 'antd/lib/layout'
import Popconfirm from 'antd/lib/popconfirm'
import Table from 'antd/lib/table'
import React from 'react'
import AppNav from '../AppNav'
import DocumentTitle from '../common/DocumentTitle'
import Header from '../common/Header'
import { ConnectionsContext } from '../connections/ConnectionsStore'
import ConnectionEditDrawer from './ConnectionEditDrawer'

const { Content } = Layout
const { Column } = Table

class ConnectionsView extends React.Component {
  static contextType = ConnectionsContext

  state = {
    connectionId: null,
    showEdit: false
  }

  componentDidMount() {
    this.context.loadConnections()
  }

  editConnection = connection => {
    this.setState({ connectionId: connection._id, showEdit: true })
  }

  newConnection = () => {
    this.setState({ showEdit: true, connectionId: null })
  }

  onModalClose = () => {
    this.setState({ showEdit: false, connectionId: null })
  }

  handleConnectionSaved = connection => {
    const { addUpdateConnection } = this.context
    addUpdateConnection(connection)
    this.onModalClose()
  }

  render() {
    const { connectionId, showEdit } = this.state
    const { connections, deleteConnection } = this.context

    const decoratedConnections = connections.map(connection => {
      connection.key = connection._id
      connection.displayDatabase = connection.database
      connection.displaySchema = ''
      let displayPort = connection.port ? ':' + connection.port : ''

      if (connection.driver === 'hdb') {
        connection.displayDatabase = connection.hanadatabase
        connection.displaySchema = connection.hanaSchema
        displayPort = connection.hanaport ? ':' + connection.hanaport : ''
      } else if (connection.driver === 'presto') {
        connection.displayDatabase = connection.prestoCatalog
        connection.displaySchema = connection.prestoSchema
      }

      connection.displayHost = (connection.host || '') + displayPort
      return connection
    })

    return (
      <AppNav>
        <Layout
          style={{ minHeight: '100vh' }}
          className="flex w-100 flex-column h-100"
        >
          <DocumentTitle>SQLPad - Connections</DocumentTitle>

          <Header title="Connections">
            <Button type="primary" onClick={this.newConnection}>
              New connection
            </Button>
          </Header>

          <Content className="ma4">
            <div className="bg-white">
              <div>
                <Table
                  locale={{ emptyText: 'No connections found' }}
                  dataSource={decoratedConnections}
                  pagination={false}
                  className="w-100"
                >
                  <Column
                    title="Name"
                    key="name"
                    render={(text, record) => {
                      return (
                        <a
                          href="#connection"
                          onClick={() => this.editConnection(record)}
                        >
                          {record.name}
                        </a>
                      )
                    }}
                  />
                  <Column title="Driver" key="driver" dataIndex="driver" />
                  <Column title="Host" key="host" dataIndex="displayHost" />
                  <Column
                    title="Database / Tenant / Catalog"
                    key="database"
                    dataIndex="displayDatabase"
                  />
                  <Column
                    title="Schema"
                    key="schema"
                    dataIndex="displaySchema"
                  />
                  <Column
                    title="Delete"
                    key="delete"
                    render={(text, record) => {
                      return (
                        <Popconfirm
                          title="Delete connection?"
                          onConfirm={e => deleteConnection(record._id)}
                          onCancel={() => {}}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button icon="delete" type="danger" />
                        </Popconfirm>
                      )
                    }}
                  />
                </Table>
              </div>
            </div>
            <ConnectionEditDrawer
              connectionId={connectionId}
              visible={showEdit}
              onClose={this.onModalClose}
              onConnectionSaved={this.handleConnectionSaved}
            />
          </Content>
        </Layout>
      </AppNav>
    )
  }
}

export default ConnectionsView
