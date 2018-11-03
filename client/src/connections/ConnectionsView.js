import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import ConnectionForm from './ConnectionForm'
import Header from '../common/Header'

import message from 'antd/lib/message'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'

import Popconfirm from 'antd/lib/popconfirm'
import 'antd/lib/popconfirm/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'

const { Content } = Layout
const { Column } = Table

class ConnectionsView extends React.Component {
  state = {
    showModal: false,
    selectedConnection: {}
  }

  componentDidMount() {
    document.title = 'SQLPad - Connections'
    this.props.loadConnections()
  }

  handleSelect = connection => {
    this.setState({
      selectedConnection: Object.assign({}, connection),
      showModal: true
    })
  }

  handleDelete = async connection => this.props.deleteConnection(connection._id)

  handleNewConnectionClick = () => {
    this.setState({
      selectedConnection: {},
      showModal: true
    })
  }

  setConnectionValue = (attribute, value) => {
    const { selectedConnection } = this.state
    if (selectedConnection) {
      selectedConnection[attribute] = value
      this.setState({
        selectedConnection
      })
    }
  }

  testConnection = () => {
    const { selectedConnection } = this.state
    return this.props.testConnection(selectedConnection)
  }

  saveConnection = async () => {
    const { selectedConnection } = this.state
    await this.props.saveConnection(selectedConnection)
    this.setState({ selectedConnection: {}, showModal: false })
  }

  renderTable() {
    const { connections } = this.props

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
              <a href="#connection" onClick={() => this.handleSelect(record)}>
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
                onConfirm={e => this.handleDelete(record)}
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
    )
  }

  renderModal() {
    const { showModal, selectedConnection } = this.state
    const { saving, testing, testFailed, testSuccess } = this.props

    return (
      <Modal
        title={selectedConnection._id ? 'Edit connection' : 'New connection'}
        visible={showModal}
        footer={null}
        width={'600px'}
        destroyOnClose={true}
        onCancel={() =>
          this.setState({
            showModal: false,
            testFailed: false,
            testSuccess: false
          })
        }
      >
        <ConnectionForm
          selectedConnection={selectedConnection}
          setConnectionValue={this.setConnectionValue}
          testConnection={this.testConnection}
          saveConnection={this.saveConnection}
          isTesting={testing}
          isSaving={saving}
          testFailed={testFailed}
          testSuccess={testSuccess}
        />
      </Modal>
    )
  }

  render() {
    return (
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header title="Connections">
          <Button type="primary" onClick={this.handleNewConnectionClick}>
            New connection
          </Button>
        </Header>
        <Content className="ma4">
          <div className="bg-white">{this.renderTable()}</div>
          {this.renderModal()}
        </Content>
      </Layout>
    )
  }
}

export default ConnectionsView
