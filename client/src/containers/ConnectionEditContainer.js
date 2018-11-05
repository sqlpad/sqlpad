import fetchJson from '../utilities/fetch-json.js'
import { Container } from 'unstated'

const INITIAL_STATE = {
  visible: false,
  connectionEdits: {},
  testFailed: false,
  testing: false,
  testSuccess: false,
  title: '',
  saving: false,
  savingError: null
}

class ConnectionEditContainer extends Container {
  state = INITIAL_STATE

  editConnection = connection => {
    this.setState({
      connectionEdits: Object.assign({}, connection),
      testFailed: false,
      testing: false,
      testSuccess: false,
      visible: true,
      title: connection && connection._id ? 'New connection' : 'Edit connection'
    })
  }

  cancelEdit = () => {
    this.setState(INITIAL_STATE)
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

  saveConnection = async () => {
    const { saving, connectionEdits } = this.state
    if (saving) {
      return
    }

    this.setState({ saving: true })

    let json
    if (connectionEdits._id) {
      json = await fetchJson(
        'PUT',
        '/api/connections/' + connectionEdits._id,
        connectionEdits
      )
    } else {
      json = await fetchJson('POST', '/api/connections', connectionEdits)
    }

    if (json.error) {
      await this.setState({ saving: false, savingError: json.error })
    } else {
      await this.setState(INITIAL_STATE)
    }

    return json
  }
}

export default ConnectionEditContainer
