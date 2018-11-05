import fetchJson from '../utilities/fetch-json.js'
import { Container } from 'unstated'
import message from 'antd/lib/message'

const ONE_HOUR_MS = 1000 * 60 * 60

class ConnectionsContainer extends Container {
  state = {
    connections: [],
    lastUpdated: null,
    loading: false,
    loadingError: null
  }

  // Calls delete API and updates store
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

  // Updates store (is not resonponsible for API call)
  addUpdateConnection = async connection => {
    const found = this.state.connections.find(c => c._id === connection._id)
    if (found) {
      const connections = this.state.connections.map(c => {
        if (c._id === connection._id) {
          return connection
        }
        return c
      })
      return this.setState({ connections })
    }

    const connections = [connection].concat(this.state.connections)
    return this.setState({ connections })
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
