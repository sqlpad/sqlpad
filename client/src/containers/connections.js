import fetchJson from '../utilities/fetch-json.js'
import { Container } from 'unstated'
import message from 'antd/lib/message'

const ONE_HOUR_MS = 1000 * 60 * 60

class ConnectionsContainer extends Container {
  state = {
    connections: [],
    lastUpdated: null,
    loading: false,
    loadingError: null,
    saving: false,
    savingError: null,
    testFailed: false,
    testing: false,
    testSuccess: false
  }

  testConnection = async connection => {
    this.setState({ testing: true })
    const json = await fetchJson('POST', '/api/test-connection', connection)
    return this.setState({
      testing: false,
      testFailed: json.error ? true : false,
      testSuccess: json.error ? false : true
    })
  }

  deleteConnection = async connectionId => {
    const json = await fetchJson('DELETE', '/api/connections/' + connectionId)
    // TODO should errors be messaged like this or should they be captured in state?
    if (json.error) {
      return message.error('Delete failed')
    }
    const connections = this.state.connections.filter(
      c => c._id !== connectionId
    )
    return this.setState({ connections })
  }

  saveConnection = async connection => {
    const { saving } = this.state
    if (saving) {
      return
    }

    this.setState({ saving: true })

    // Update existing
    if (connection._id) {
      const json = await fetchJson(
        'PUT',
        '/api/connections/' + connection._id,
        connection
      )

      if (json.error) {
        return this.setState({ saving: false, savingError: json.error })
      }

      const connections = this.state.connections.map(c => {
        if (c._id === connection._id) {
          return connection
        }
        return c
      })

      return this.setState({ saving: false, connections })
    }

    // Save new
    const json = await fetchJson('POST', '/api/connections', connection)

    if (json.error) {
      return this.setState({ saving: false, savingError: json.error })
    }

    const connections = [json.connection].concat(this.state.connections)

    return this.setState({ saving: false, connections })
  }

  loadConnections = async force => {
    const { lastUpdated, loading, connections } = this.state
    if (loading) {
      return
    }

    if (
      force ||
      !connections.length ||
      (lastUpdated && new Date() - lastUpdated > ONE_HOUR_MS)
    ) {
      await this.setState({ loading: true })
      const { error, connections } = await fetchJson('GET', '/api/connections/')
      if (error) {
        message.error(error)
      }
      return this.setState({
        loadingError: error,
        connections,
        loading: false,
        lastUpdated: new Date()
      })
    }
  }
}

export default ConnectionsContainer
