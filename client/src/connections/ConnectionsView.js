import Component from '@reactions/component'
import Button from 'antd/lib/button'
import Layout from 'antd/lib/layout'
import Popconfirm from 'antd/lib/popconfirm'
import Table from 'antd/lib/table'
import React from 'react'
import { Subscribe } from 'unstated'
import AppNav from '../AppNav'
import DocumentTitle from '../common/DocumentTitle'
import Header from '../common/Header'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import ConnectionEditModal from './ConnectionEditModal'

const { Content } = Layout
const { Column } = Table

class ConnectionsView extends React.Component {
  state = {
    connectionId: null,
    showEdit: false
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

  render() {
    const { connectionId, showEdit } = this.state

    return (
      <AppNav>
        <Subscribe to={[ConnectionsContainer]}>
          {connectionsContainer => {
            const decoratedConnections = connectionsContainer.state.connections.map(
              connection => {
                connection.key = connection._id
                connection.displayDatabase = connection.database
                connection.displaySchema = ''
                let displayPort = connection.port ? ':' + connection.port : ''

                if (connection.driver === 'hdb') {
                  connection.displayDatabase = connection.hanadatabase
                  connection.displaySchema = connection.hanaSchema
                  displayPort = connection.hanaport
                    ? ':' + connection.hanaport
                    : ''
                } else if (connection.driver === 'presto') {
                  connection.displayDatabase = connection.prestoCatalog
                  connection.displaySchema = connection.prestoSchema
                }

                connection.displayHost = (connection.host || '') + displayPort
                return connection
              }
            )

            return (
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
                      <Component
                        didMount={connectionsContainer.loadConnections}
                      />
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
                        <Column
                          title="Driver"
                          key="driver"
                          dataIndex="driver"
                        />
                        <Column
                          title="Host"
                          key="host"
                          dataIndex="displayHost"
                        />
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
                                onConfirm={e =>
                                  connectionsContainer.deleteConnection(
                                    record._id
                                  )
                                }
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
                  <ConnectionEditModal
                    connectionId={connectionId}
                    visible={showEdit}
                    onClose={this.onModalClose}
                    onConnectionSaved={connection => {
                      connectionsContainer.addUpdateConnection(connection)
                      this.onModalClose()
                    }}
                  />
                </Content>
              </Layout>
            )
          }}
        </Subscribe>
      </AppNav>
    )
  }
}

export default ConnectionsView
