import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import ConnectionForm from './ConnectionForm'

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

const { Header, Content } = Layout
const { Column } = Table

class ConnectionsView extends React.Component {
  state = {
    showModal: false,
    connections: [],
    selectedConnection: {},
    isTesting: false,
    isSaving: false,
    testSuccess: false,
    testFailed: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Connections'
    this.loadConnectionsFromServer()
  }

  handleSelect = connection => {
    this.setState({
      selectedConnection: Object.assign({}, connection),
      showModal: true
    })
  }

  handleDelete = connection => {
    const { selectedConnection } = this.state
    fetchJson('DELETE', '/api/connections/' + connection._id).then(json => {
      if (json.error) {
        return message.error('Delete failed')
      }
      message.success('Connection deleted')
      if (selectedConnection && connection._id === selectedConnection._id) {
        this.setState({ selectedConnection: null })
      }
      this.loadConnectionsFromServer()
    })
  }

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
        selectedConnection,
        testFailed: false,
        testSuccess: false
      })
    }
  }

  loadConnectionsFromServer = () => {
    fetchJson('GET', '/api/connections').then(json => {
      if (json.error) {
        message.error(json.error)
      }
      this.setState({ connections: json.connections })
    })
  }

  testConnection = () => {
    const { selectedConnection } = this.state
    this.setState({ isTesting: true })
    fetchJson('POST', '/api/test-connection', selectedConnection).then(json => {
      this.setState({
        isTesting: false,
        testFailed: json.error ? true : false,
        testSuccess: json.error ? false : true
      })
    })
  }

  saveConnection = () => {
    const { selectedConnection } = this.state
    this.setState({ isSaving: true })
    if (selectedConnection._id) {
      fetchJson(
        'PUT',
        '/api/connections/' + selectedConnection._id,
        selectedConnection
      ).then(json => {
        this.setState({ isSaving: false })
        if (json.error) {
          return message.error('Save failed')
        }
        message.success('Connection saved')
        this.setState({ selectedConnection: {}, showModal: false })
        this.loadConnectionsFromServer()
      })
    } else {
      fetchJson('POST', '/api/connections', selectedConnection).then(json => {
        this.setState({
          isSaving: false,
          selectedConnection: json.connection || selectedConnection
        })
        if (json.error) {
          return message.error('Save failed')
        }
        message.success('Connection saved')
        this.setState({ selectedConnection: {}, showModal: false })
        this.loadConnectionsFromServer()
      })
    }
  }

  renderTable() {
    const { connections } = this.state

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
    const {
      showModal,
      isTesting,
      isSaving,
      selectedConnection,
      testFailed,
      testSuccess
    } = this.state

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
          isTesting={isTesting}
          isSaving={isSaving}
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
        <Header className=" pr4 pl4">
          <div className="f1 fl white">Connections</div>
          <div className="fr">
            <Button type="primary" onClick={this.handleNewConnectionClick}>
              New connection
            </Button>
          </div>
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
