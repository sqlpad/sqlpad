import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import Alert from 'react-s-alert'
import ConnectionForm from './ConnectionForm'
import SimpleTable from '../common/SimpleTable'
import SimpleTh from '../common/SimpleTableTh'
import Modal from '../common/Modal'
import Button from '../common/Button'
import DeleteButton from '../common/DeleteButton'
import SimpleTd from '../common/SimpleTableTd'

class ConnectionsView extends React.Component {
  state = {
    showModal: false,
    connections: [],
    selectedConnection: {},
    isTesting: false,
    isSaving: false
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
        return Alert.error('Delete failed')
      }
      Alert.success('Connection deleted')
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
      this.setState({ selectedConnection })
    }
  }

  loadConnectionsFromServer = () => {
    fetchJson('GET', '/api/connections').then(json => {
      if (json.error) {
        Alert.error(json.error)
      }
      this.setState({ connections: json.connections })
    })
  }

  testConnection = () => {
    const { selectedConnection } = this.state
    this.setState({ isTesting: true })
    fetchJson('POST', '/api/test-connection', selectedConnection).then(json => {
      this.setState({ isTesting: false })
      if (json.error) {
        return Alert.error('Test Failed')
      }
      return Alert.success('Test successful')
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
          return Alert.error('Save failed')
        }
        Alert.success('Connection saved')
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
          return Alert.error('Save failed')
        }
        Alert.success('Connection saved')
        this.setState({ selectedConnection: {}, showModal: false })
        this.loadConnectionsFromServer()
      })
    }
  }

  render() {
    const {
      showModal,
      isTesting,
      isSaving,
      connections,
      selectedConnection
    } = this.state
    return (
      <div className="flex w-100 flex-column">
        <div>
          <div className="ma4 f1 fl">Connections</div>
          <Button
            className="ma4 fr"
            primary
            onClick={this.handleNewConnectionClick}
          >
            New connection
          </Button>
        </div>
        <SimpleTable
          className="w-100"
          renderHeader={() => {
            return (
              <tr>
                <SimpleTh>Name</SimpleTh>
                <SimpleTh>Driver</SimpleTh>
                <SimpleTh>Host</SimpleTh>
                <SimpleTh>Database / Tenant / Catalog</SimpleTh>
                <SimpleTh>Schema</SimpleTh>
                <SimpleTh>Delete</SimpleTh>
              </tr>
            )
          }}
          renderBody={() =>
            connections.map(connection => {
              let db_name = connection.database
              let db_schema = ''
              let db_port = connection.port ? ':' + connection.port : ''

              if (connection.driver === 'hdb') {
                db_name = connection.hanadatabase
                db_schema = connection.hanaSchema
                db_port = connection.hanaport ? ':' + connection.hanaport : ''
              } else if (connection.driver === 'presto') {
                db_name = connection.prestoCatalog
                db_schema = connection.prestoSchema
              }

              return (
                <tr key={connection._id}>
                  <SimpleTd>
                    <a
                      href="#connection"
                      onClick={() => this.handleSelect(connection)}
                    >
                      {connection.name}
                    </a>
                  </SimpleTd>
                  <SimpleTd>{connection.driver}</SimpleTd>
                  <SimpleTd>
                    {connection.host}
                    {db_port}
                  </SimpleTd>
                  <SimpleTd>{db_name}</SimpleTd>
                  <SimpleTd>{db_schema}</SimpleTd>
                  <SimpleTd>
                    <DeleteButton
                      onClick={() => this.handleDelete(connection)}
                    />
                  </SimpleTd>
                </tr>
              )
            })
          }
        />
        <Modal
          title={selectedConnection._id ? 'Edit connection' : 'New connection'}
          show={showModal}
          onHide={() => this.setState({ showModal: false })}
          renderBody={() => {
            return (
              <ConnectionForm
                selectedConnection={selectedConnection}
                setConnectionValue={this.setConnectionValue}
                testConnection={this.testConnection}
                saveConnection={this.saveConnection}
                isTesting={isTesting}
                isSaving={isSaving}
              />
            )
          }}
        />
      </div>
    )
  }
}

export default ConnectionsView
