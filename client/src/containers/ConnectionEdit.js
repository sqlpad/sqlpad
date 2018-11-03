import fetchJson from '../utilities/fetch-json.js'
import { Container } from 'unstated'

class ConnectionEditContainer extends Container {
  state = {
    connectionEdits: null,
    testFailed: false,
    testing: false,
    testSuccess: false
  }

  editConnection = (connection = {}) => {
    this.setState({
      connectionEdits: Object.assign({}, connection),
      testFailed: false,
      testing: false,
      testSuccess: false
    })
  }

  cancelEdit = () => {
    this.setState({
      connectionEdits: null,
      testFailed: false,
      testing: false,
      testSuccess: false
    })
  }

  setConnectionValue = (key, value) => {
    const { connectionEdits } = this.state
    connectionEdits[key] = value
    return this.setState({ connectionEdits })
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
}

export default ConnectionEditContainer
