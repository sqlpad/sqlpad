import Button from 'antd/lib/button'
import Drawer from 'antd/lib/drawer'
import Icon from 'antd/lib/icon'
import List from 'antd/lib/list'
import Popconfirm from 'antd/lib/popconfirm'
import React from 'react'
import ConnectionEditDrawer from './ConnectionEditDrawer'
import { withConnectionsContext } from './ConnectionsStore'

class ConnectionListDrawer extends React.Component {
  state = {
    connectionId: null,
    showEdit: false
  }

  componentDidMount() {
    this.props.connectionsContext.loadConnections()
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
    const { addUpdateConnection } = this.props.connectionsContext
    addUpdateConnection(connection)
    this.onModalClose()
  }

  render() {
    const { connectionsContext, visible, onClose } = this.props
    const { connectionId, showEdit } = this.state
    const {
      selectConnection,
      selectedConnectionId,
      connections,
      deleteConnection
    } = connectionsContext

    // TODO - server driver implementations should implement functions
    // that get decorated normalized display values
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

    // The last "connection" list item will be an input to add a connection
    // This is just something simple to branch off of in List.renderItem prop
    decoratedConnections.push('ADD_BUTTON')

    return (
      <Drawer
        title="Connections"
        visible={visible}
        width={600}
        destroyOnClose={true}
        onClose={onClose}
        placement="left"
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto'
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={decoratedConnections}
          renderItem={item => {
            if (item === 'ADD_BUTTON') {
              return (
                <List.Item>
                  <Button
                    size="large"
                    className="w-100"
                    onClick={this.newConnection}
                  >
                    <Icon type="plus" /> Add connection
                  </Button>
                </List.Item>
              )
            }

            let description = ''
            if (item.user) {
              description = item.user + '@'
            }
            description += [
              item.displayHost,
              item.displayDatabase,
              item.displaySchema
            ]
              .filter(part => part && part.trim())
              .join(' / ')

            return (
              <List.Item
                actions={[
                  selectedConnectionId === item._id ? (
                    <Button className="w4" disabled>
                      selected
                    </Button>
                  ) : (
                    <Button
                      className="w4"
                      onClick={() => {
                        selectConnection(item._id)
                        onClose()
                      }}
                    >
                      select
                    </Button>
                  ),
                  <Button onClick={() => this.editConnection(item)}>
                    edit
                  </Button>,
                  <Popconfirm
                    title="Delete connection?"
                    onConfirm={e => deleteConnection(item._id)}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon="delete" type="danger" />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <div>
                      {item.driver}
                      <br />
                      {description}
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
        <ConnectionEditDrawer
          connectionId={connectionId}
          visible={showEdit}
          onClose={this.onModalClose}
          onConnectionSaved={this.handleConnectionSaved}
          placement="left"
        />
      </Drawer>
    )
  }
}

export default withConnectionsContext(ConnectionListDrawer)
