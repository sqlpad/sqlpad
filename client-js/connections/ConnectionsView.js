import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import Alert from 'react-s-alert'
import ConnectionList from './ConnectionList'
import ConnectionForm from './ConnectionForm'
const _ = window._

class ConnectionsView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      connections: [],
      selectedConnection: null,
      isTesting: false,
      isSaving: false
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.onNewConnectionClick = this.onNewConnectionClick.bind(this)
    this.setConnectionValue = this.setConnectionValue.bind(this)
    this.loadConnectionsFromServer = this.loadConnectionsFromServer.bind(this)
    this.testConnection = this.testConnection.bind(this)
    this.saveConnection = this.saveConnection.bind(this)
  }

  componentDidMount () {
    this.loadConnectionsFromServer()
  }

  handleSelect (connection) {
    this.setState({
      selectedConnection: _.clone(connection)
    })
  }

  handleDelete (connection) {
    fetchJson('DELETE', this.props.config.baseUrl + '/api/connections/' + connection._id)
      .then((json) => {
        if (json.error) return Alert.error('Delete failed')
        Alert.success('Connection deleted')
        if (this.state.selectedConnection && connection._id === this.state.selectedConnection._id) {
          this.setState({selectedConnection: null})
        }
        this.loadConnectionsFromServer()
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  onNewConnectionClick () {
    this.setState({
      selectedConnection: {}
    })
  }

  setConnectionValue (attribute, value) {
    var selectedConnection = this.state.selectedConnection
    if (selectedConnection) {
      selectedConnection[attribute] = value
      this.setState({selectedConnection: selectedConnection})
    }
  }

  loadConnectionsFromServer () {
    fetchJson('get', this.props.config.baseUrl + '/api/connections')
      .then((json) => {
        if (json.error) Alert.error(json.error)
        this.setState({connections: json.connections})
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  testConnection () {
    this.setState({isTesting: true})
    fetchJson('POST', this.props.config.baseUrl + '/api/test-connection', this.state.selectedConnection)
      .then((json) => {
        this.setState({isTesting: false})
        if (json.error) return Alert.error('Test Failed')
        return Alert.success('Test successful')
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  saveConnection () {
    this.setState({isSaving: true})
    if (this.state.selectedConnection._id) {
      fetchJson('PUT', this.props.config.baseUrl + '/api/connections/' + this.state.selectedConnection._id, this.state.selectedConnection)
        .then((json) => {
          this.setState({isSaving: false})
          if (json.error) return Alert.error('Save failed')
          Alert.success('Connection saved')
          this.setState({selectedConnection: null})
          this.loadConnectionsFromServer()
        })
        .catch((ex) => {
          console.error(ex.toString())
          Alert.error('Something is broken')
        })
    } else {
      fetchJson('POST', this.props.config.baseUrl + '/api/connections', this.state.selectedConnection)
        .then((json) => {
          this.setState({
            isSaving: false,
            selectedConnection: json.connection || this.state.selectedConnection
          })
          if (json.error) return Alert.error('Save failed')
          Alert.success('Connection saved')
          this.setState({selectedConnection: null})
          this.loadConnectionsFromServer()
        })
        .catch((ex) => {
          console.error(ex.toString())
          Alert.error('Something is broken')
        })
    }
  }

  render () {
    return (
      <div>
        <ConnectionList
          connections={this.state.connections}
          selectedConnection={this.state.selectedConnection}
          handleSelect={this.handleSelect}
          handleDelete={this.handleDelete}
          onNewConnectionClick={this.onNewConnectionClick} />
        <ConnectionForm
          selectedConnection={this.state.selectedConnection}
          setConnectionValue={this.setConnectionValue}
          testConnection={this.testConnection}
          saveConnection={this.saveConnection}
          isTesting={this.state.isTesting}
          isSaving={this.state.isSaving} />
      </div>
    )
  }
}

export default ConnectionsView
