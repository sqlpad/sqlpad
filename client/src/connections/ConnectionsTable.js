import React from 'react'
import { Subscribe } from 'unstated'
import Component from '@reactions/component'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import ConnectionEditContainer from '../containers/ConnectionEditContainer'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'

import Popconfirm from 'antd/lib/popconfirm'
import 'antd/lib/popconfirm/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

const { Column } = Table

class ConnectionsTable extends React.Component {
  render() {
    return (
      <Subscribe to={[ConnectionsContainer, ConnectionEditContainer]}>
        {(connectionsContainer, connectionEditContainer) => {
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
            <div>
              <Component didMount={connectionsContainer.loadConnections} />
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
                        onClick={() =>
                          connectionEditContainer.editConnection(record)
                        }
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
                <Column title="Schema" key="schema" dataIndex="displaySchema" />
                <Column
                  title="Delete"
                  key="delete"
                  render={(text, record) => {
                    return (
                      <Popconfirm
                        title="Delete connection?"
                        onConfirm={e =>
                          connectionsContainer.deleteConnection(record._id)
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
          )
        }}
      </Subscribe>
    )
  }
}

export default ConnectionsTable
