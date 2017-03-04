var React = require('react')
var fetchJson = require('../utilities/fetch-json.js')
var Alert = require('react-s-alert').default
var Panel = require('react-bootstrap/lib/Panel')
var Form = require('react-bootstrap/lib/Form')
var FormGroup = require('react-bootstrap/lib/FormGroup')
var FormControl = require('react-bootstrap/lib/FormControl')
var ControlLabel = require('react-bootstrap/lib/ControlLabel')
var Checkbox = require('react-bootstrap/lib/Checkbox')
var Button = require('react-bootstrap/lib/Button')
var ListGroup = require('react-bootstrap/lib/ListGroup')
var Glyphicon = require('react-bootstrap/lib/Glyphicon')
var Popover = require('react-bootstrap/lib/Popover')
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger')
const _ = window._

const TEXT = 'TEXT'
const PASSWORD = 'PASSWORD'
const CHECKBOX = 'CHECKBOX'


// fields config for all connection fields except for name and driver
const fields = {
  host: {
    key: 'host',
    formType: TEXT,
    label: 'Host/Server/IP Address'
  },
  port: {
    key: 'port',
    formType: TEXT,
    label: 'Port (optional)'
  },
  database: {
    key: 'database',
    formType: TEXT,
    label: 'Database'
  },
  username: {
    key: 'username',
    formType: TEXT,
    label: 'Database Username'
  },
  password: {
    key: 'password',
    formType: PASSWORD,
    label: 'Database Password'
  },
  domain: {
    key: 'domain',
    formType: TEXT,
    label: 'Domain'
  },
  sqlserverEncrypt: {
    key: 'sqlserverEncrypt',
    formType: CHECKBOX,
    label: 'Encrypt (necessary for Azure)'
  },
  postgresSsl: {
    key: 'postgresSsl',
    formType: CHECKBOX,
    label: 'Use SSL'
  },
  postgresCert: {
    key: 'postgresCert',
    formType: TEXT,
    label: 'Database Certificate Path'
  },
  postgresKey: {
    key: 'postgresKey',
    formType: TEXT,
    label: 'Database Key Path'
  },
  mysqlInsecureAuth: {
    key: 'mysqlInsecureAuth',
    formType: CHECKBOX,
    label: 'Use old/insecure pre 4.1 Auth System'
  },
  prestoCatalog: {
    key: 'prestoCatalog',
    formType: TEXT,
    label: 'Catalog'
  },
  prestoSchema: {
    key: 'prestoSchema',
    formType: TEXT,
    label: 'Schema'
  }
}

const driverFields = {
  crate: [
    fields.host,
    fields.port
  ],
  mysql: [
    fields.host,
    fields.port,
    fields.database,
    fields.username,
    fields.password,
    fields.mysqlInsecureAuth
  ],
  postgres: [
    fields.host,
    fields.port,
    fields.database,
    fields.username,
    fields.password,
    fields.postgresSsl,
    fields.postgresCert,
    fields.postgresKey
  ],
  presto: [
    fields.host,
    fields.port,
    fields.username,
    fields.prestoCatalog,
    fields.prestoSchema
  ],
  sqlserver: [
    fields.host,
    fields.port,
    fields.database,
    fields.domain,
    fields.username,
    fields.password,
    fields.sqlserverEncrypt
  ],
  vertica: [
    fields.host,
    fields.port,
    fields.database,
    fields.username,
    fields.password
  ]
}

class ConnectionController extends React.Component {

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

module.exports = ConnectionController


const connectionListStyle = {
  position: 'absolute',
  left: 0,
  width: '50%',
  top: 0,
  bottom: 0,
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class ConnectionList extends React.Component {
  render () {
    const { connections, selectedConnection, handleSelect, handleDelete, onNewConnectionClick } = this.props
    var listRows = connections.map((connection) => {
      return (
        <ConnectionListRow
          key={connection._id}
          connection={connection}
          selectedConnection={selectedConnection}
          handleSelect={handleSelect}
          handleDelete={handleDelete} />
      )
    })
    return (
      <div className='ConnectionList' style={connectionListStyle}>
        <ControlLabel>Connections</ControlLabel>
        <ListGroup className='ConnectionListContents'>
          {listRows}
        </ListGroup>
        <Button onClick={onNewConnectionClick}>
          New Connection
        </Button>
      </div>
    )
  }
}

ConnectionList.propTypes = {
  connections: React.PropTypes.array.isRequired,
  selectedConnection: React.PropTypes.object,
  handleSelect: React.PropTypes.func.isRequired,
  handleDelete: React.PropTypes.func.isRequired,
  onNewConnectionClick: React.PropTypes.func.isRequired
}



class ConnectionListRow extends React.Component {

  constructor (props) {
    super(props)
    this.onDelete = this.onDelete.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  onDelete (e) {
    this.props.handleDelete(this.props.connection)
  }

  onSelect (e) {
    this.props.handleSelect(this.props.connection)
  }

  render () {
    var getClassNames = () => {
      if (this.props.selectedConnection && this.props.selectedConnection._id === this.props.connection._id) {
        return 'list-group-item ListRow ListRowSelected'
      } else {
        return 'list-group-item ListRow'
      }
    }
    const popoverClick = (
      <Popover id='popover-trigger-click' title='Are you sure?'>
        <Button bsStyle='danger' onClick={this.onDelete} style={{width: '100%'}}>delete</Button>
      </Popover>
    )
    return (
      <li className={getClassNames()}>
        <h4><a href='#' onClick={this.onSelect}>{this.props.connection.name}</a></h4>
        <h5>{this.props.connection.driver} {this.props.connection.host}/{this.props.connection.database}</h5>
        <OverlayTrigger trigger='click' placement='left' container={this} rootClose overlay={popoverClick}>
          <a className='ListRowDeleteButton' href='#'><Glyphicon glyph='trash' /></a>
        </OverlayTrigger>
      </li>
    )
  }
}

ConnectionListRow.propTypes = {
  handleDelete: React.PropTypes.func.isRequired,
  handleSelect: React.PropTypes.func.isRequired,
  selectedConnection: React.PropTypes.object,
  connection: React.PropTypes.object.isRequired
}

ConnectionListRow.defaultProps = {
  selectedConnection: {}
}


const connectionFormStyle = {
  position: 'absolute',
  right: 0,
  width: '50%',
  top: 0,
  bottom: 0,
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class ConnectionForm extends React.Component {
  constructor (props) {
    super(props)
    this.onTextInputChange = this.onTextInputChange.bind(this)
    this.onCheckboxChange = this.onCheckboxChange.bind(this)
  }

  onTextInputChange (e) {
    this.props.setConnectionValue(e.target.name, e.target.value)
  }

  onCheckboxChange (e) {
    this.props.setConnectionValue(e.target.name, e.target.checked)
  }

  renderDriverFields () {
    const { selectedConnection } = this.props
    const connection = selectedConnection

    if (connection.driver) {
      const fields = driverFields[connection.driver]
      return fields.map(field => {
        if (field.formType === TEXT) {
          const value = connection[field.key] || ''
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl type='text' name={field.key} value={value} onChange={this.onTextInputChange} />
            </FormGroup>
          )
        } else if (field.formType === PASSWORD) {
          const value = connection[field.key] || ''
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl type='password' autoComplete='new-password' name={field.key} value={value} onChange={this.onTextInputChange} />
            </FormGroup>
          )
        } else if (field.formType === CHECKBOX) {
          const checked = connection[field.key] || false
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <Checkbox checked={checked} name={field.key} onChange={this.onCheckboxChange}>
                {field.label}
              </Checkbox>
            </FormGroup>
          )
        }
        return null
      })
    }
  }

  render () {
    const { selectedConnection, isSaving, isTesting, testConnection, saveConnection } = this.props
    const connection = selectedConnection
    if (!selectedConnection) {
      return (
        <div className='ConnectionForm' style={connectionFormStyle} />
      )
    }
    return (
      <div className='ConnectionForm' style={connectionFormStyle}>
        <Panel>
          <Form>
            <FormGroup controlId='name' validationState={(connection.name ? null : 'error')}>
              <ControlLabel>Connection Name</ControlLabel>
              <FormControl type='text' name='name' value={connection.name || ''} onChange={this.onTextInputChange} />
            </FormGroup>
            <FormGroup controlId='driver' validationState={(connection.driver ? null : 'error')}>
              <ControlLabel>Database Driver</ControlLabel>
              <FormControl componentClass='select' name='driver' value={connection.driver || ''} onChange={this.onTextInputChange}>
                <option value='' />
                <option value='crate'>Crate</option>
                <option value='mysql'>MySQL</option>
                <option value='postgres'>Postgres</option>
                <option value='presto'>Presto</option>
                <option value='sqlserver'>SQL Server</option>
                <option value='vertica'>Vertica</option>
              </FormControl>
            </FormGroup>
            {this.renderDriverFields()}
            <Button style={{width: 100}} onClick={saveConnection} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {' '}
            <Button style={{width: 100}} onClick={testConnection} disabled={isTesting}>
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
}

ConnectionForm.propTypes = {
  selectedConnection: React.PropTypes.object,
  testConnection: React.PropTypes.func.isRequired,
  saveConnection: React.PropTypes.func.isRequired,
  isTesting: React.PropTypes.bool,
  isSaving: React.PropTypes.bool
}

ConnectionForm.defaultProps = {
  isTesting: false,
  isSaving: false,
  selectedConnection: null
}
