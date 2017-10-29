import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import Alert from 'react-s-alert'
import ConnectionList from './ConnectionList'
import ConnectionForm from './ConnectionForm'

class ConnectionsView extends React.Component {
  state = {
    connections: [],
    selectedConnection: null,
    isTesting: false,
    isSaving: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Connections'
    this.loadConnectionsFromServer()
  }

  handleSelect = connection => {
    this.setState({
      selectedConnection: Object.assign({}, connection)
    })
  }

  handleDelete = connection => {
    const { selectedConnection } = this.state
    fetchJson('DELETE', '/api/connections/' + connection._id).then(json => {
      if (json.error) return Alert.error('Delete failed')
      Alert.success('Connection deleted')
      if (selectedConnection && connection._id === selectedConnection._id) {
        this.setState({ selectedConnection: null })
      }
      this.loadConnectionsFromServer()
    })
  }

  onNewConnectionClick = () => {
    this.setState({
      selectedConnection: {}
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
      if (json.error) Alert.error(json.error)
      this.setState({ connections: json.connections })
    })
  }

  testConnection = () => {
    const { selectedConnection } = this.state
    this.setState({ isTesting: true })
    fetchJson('POST', '/api/test-connection', selectedConnection).then(json => {
      this.setState({ isTesting: false })
      if (json.error) return Alert.error('Test Failed')
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
        if (json.error) return Alert.error('Save failed')
        Alert.success('Connection saved')
        this.setState({ selectedConnection: null })
        this.loadConnectionsFromServer()
      })
    } else {
      fetchJson('POST', '/api/connections', selectedConnection).then(json => {
        this.setState({
          isSaving: false,
          selectedConnection: json.connection || selectedConnection
        })
        if (json.error) return Alert.error('Save failed')
        Alert.success('Connection saved')
        this.setState({ selectedConnection: null })
        this.loadConnectionsFromServer()
      })
    }
  }

  render() {
    const { isTesting, isSaving, connections, selectedConnection } = this.state
    return (
      <div className="flex-100">
        <ConnectionList
          connections={connections}
          selectedConnection={selectedConnection}
          handleSelect={this.handleSelect}
          handleDelete={this.handleDelete}
          onNewConnectionClick={this.onNewConnectionClick}
        />
        <ConnectionForm
          selectedConnection={selectedConnection}
          setConnectionValue={this.setConnectionValue}
          testConnection={this.testConnection}
          saveConnection={this.saveConnection}
          isTesting={isTesting}
          isSaving={isSaving}
        />
      </div>
    )
  }
}

export default ConnectionsView
