var React = require('react')
var fetchJson = require('./fetch-json.js')
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

var ConnectionController = React.createClass({
  getInitialState: function () {
    return {
      connections: [],
      selectedConnection: null,
      isTesting: false,
      isSaving: false
    }
  },
  componentDidMount: function () {
    this.loadConnectionsFromServer()
  },
  handleSelect: function (connection) {
    this.setState({
      selectedConnection: _.clone(connection)
    })
  },
  handleDelete: function (connection) {
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
  },
  onNewConnectionClick: function () {
    this.setState({
      selectedConnection: {}
    })
  },
  setConnectionValue: function (attribute, value) {
    var selectedConnection = this.state.selectedConnection
    if (selectedConnection) {
      selectedConnection[attribute] = value
      this.setState({selectedConnection: selectedConnection})
    }
  },
  loadConnectionsFromServer: function () {
    fetchJson('get', this.props.config.baseUrl + '/api/connections')
      .then((json) => {
        if (json.error) Alert.error(json.error)
        this.setState({connections: json.connections})
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  testConnection: function () {
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
  },
  saveConnection: function () {
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
  },
  render: function () {
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
})

module.exports = ConnectionController

var ConnectionList = React.createClass({
  style: {
    position: 'absolute',
    left: 0,
    width: '50%',
    top: 0,
    bottom: 0,
    backgroundColor: '#FDFDFD',
    overflowY: 'auto',
    padding: 10
  },
  render: function () {
    var listRows = this.props.connections.map((connection) => {
      return (
        <ConnectionListRow
          key={connection._id}
          connection={connection}
          selectedConnection={this.props.selectedConnection}
          handleSelect={this.props.handleSelect}
          handleDelete={this.props.handleDelete} />
      )
    })
    return (
      <div className='ConnectionList' style={this.style}>
        <ControlLabel>Connections</ControlLabel>
        <ListGroup className='ConnectionListContents'>
          {listRows}
        </ListGroup>
        <Button onClick={this.props.onNewConnectionClick}>
          New Connection
        </Button>
      </div>
    )
  }
})

var ConnectionListRow = React.createClass({
  onDelete: function (e) {
    this.props.handleDelete(this.props.connection)
  },
  onSelect: function (e) {
    this.props.handleSelect(this.props.connection)
  },
  render: function () {
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
})

var ConnectionForm = React.createClass({
  style: {
    position: 'absolute',
    right: 0,
    width: '50%',
    top: 0,
    bottom: 0,
    backgroundColor: '#FDFDFD',
    overflowY: 'auto',
    padding: 10
  },
  onNameChange: function (e) {
    this.props.setConnectionValue('name', e.target.value)
  },
  onDriverChange: function (e) {
    this.props.setConnectionValue('driver', e.target.value)
  },
  onHostChange: function (e) {
    this.props.setConnectionValue('host', e.target.value)
  },
  onPortChange: function (e) {
    this.props.setConnectionValue('port', e.target.value)
  },
  onDatabaseChange: function (e) {
    this.props.setConnectionValue('database', e.target.value)
  },
  onUsernameChange: function (e) {
    this.props.setConnectionValue('username', e.target.value)
  },
  onPasswordChange: function (e) {
    this.props.setConnectionValue('password', e.target.value)
  },
  onDomainChange: function (e) {
    this.props.setConnectionValue('domain', e.target.value)
  },
  onSqlserverEncryptChange: function (e) {
    this.props.setConnectionValue('sqlserverEncrypt', e.target.checked)
  },
  onMysqlInsecureAuthChange: function (e) {
    this.props.setConnectionValue('mysqlInsecureAuth', e.target.checked)
  },
  onPostgresSslChange: function (e) {
    this.props.setConnectionValue('postgresSsl', e.target.checked)
  },
  onPrestoCatalogChange: function (e) {
    this.props.setConnectionValue('prestoCatalog', e.target.value)
  },
  onPrestoSchemaChange: function (e) {
    this.props.setConnectionValue('prestoSchema', e.target.value)
  },
  render: function () {
    if (!this.props.selectedConnection) {
      return (
        <div className='ConnectionForm' style={this.style} />
      )
    }
    var connection = this.props.selectedConnection
    var databaseInput = () => {
      if (connection.driver !== 'crate' && connection.driver !== 'presto') {
        return (
          <FormGroup controlId='database'>
            <ControlLabel>Database</ControlLabel>
            <FormControl type='text' value={connection.database || ''} onChange={this.onDatabaseChange} />
          </FormGroup>
        )
      }
    }
    var usernameInput = () => {
      if (connection.driver !== 'crate') {
        return (
          <FormGroup controlId='database-username'>
            <ControlLabel>Database Username</ControlLabel>
            <FormControl type='text' value={connection.username || ''} onChange={this.onUsernameChange} />
          </FormGroup>
        )
      }
    }
    var passwordInput = () => {
      if (connection.driver !== 'crate' && connection.driver !== 'presto') {
        return (
          <FormGroup controlId='database-password'>
            <ControlLabel>Database Password</ControlLabel>
            <FormControl type='password' value={connection.password || ''} onChange={this.onPasswordChange} />
          </FormGroup>
        )
      }
    }
    var domainInput = () => {
      if (connection.driver === 'sqlserver') {
        return (
          <FormGroup controlId='domain'>
            <ControlLabel>Domain</ControlLabel>
            <FormControl type='text' value={connection.domain || ''} onChange={this.onDomainChange} />
          </FormGroup>
        )
      }
    }
    var sqlserverEncryptInput = () => {
      if (connection.driver === 'sqlserver') {
        return (
          <FormGroup controlId='sqlserverEncrypt'>
            <Checkbox checked={connection.sqlserverEncrypt || false} onChange={this.onSqlserverEncryptChange}>
              Encrypt (necessary for Azure)
            </Checkbox>
          </FormGroup>
        )
      }
    }
    var mysqlInsecureAuthInput = () => {
      if (connection.driver === 'mysql') {
        return (
          <FormGroup controlId='mysqlInsecureAuth'>
            <Checkbox checked={connection.mysqlInsecureAuth || false} onChange={this.onMysqlInsecureAuthChange}>
              Use old/insecure pre 4.1 Auth System
            </Checkbox>
          </FormGroup>
        )
      }
    }
    var postgresSslInput = () => {
      if (connection.driver === 'postgres') {
        return (
          <FormGroup controlId='postgresSsl'>
            <Checkbox checked={connection.postgresSsl || false} onChange={this.onPostgresSslChange}>
              Use SSL
            </Checkbox>
          </FormGroup>
        )
      }
    }
    return (
      <div className='ConnectionForm' style={this.style}>
        <Panel>
          <Form>
            <FormGroup controlId='name' validationState={(connection.name ? null : 'error')}>
              <ControlLabel>Friendly Connection Name</ControlLabel>
              <FormControl type='text' value={connection.name || ''} onChange={this.onNameChange} />
            </FormGroup>
            <FormGroup controlId='driver' validationState={(connection.driver ? null : 'error')}>
              <ControlLabel>Database Driver</ControlLabel>
              <FormControl componentClass='select' value={connection.driver || ''} onChange={this.onDriverChange}>
                <option value='' />
                <option value='crate'>Crate</option>
                <option value='mysql'>MySQL</option>
                <option value='postgres'>Postgres</option>
                <option value='presto'>Presto</option>
                <option value='sqlserver'>SQL Server</option>
                <option value='vertica'>Vertica</option>
              </FormControl>
            </FormGroup>
            <FormGroup controlId='host'>
              <ControlLabel>Host/Server/IP Address</ControlLabel>
              <FormControl type='text' value={connection.host || ''} onChange={this.onHostChange} />
            </FormGroup>
            <FormGroup controlId='port'>
              <ControlLabel>Port (optional)</ControlLabel>
              <FormControl type='text' value={connection.port || ''} onChange={this.onPortChange} />
            </FormGroup>
            {databaseInput()}
            {domainInput()}
            {usernameInput()}
            {passwordInput()}
            {sqlserverEncryptInput()}
            {mysqlInsecureAuthInput()}
            {postgresSslInput()}
            {(connection.driver === 'presto' ? (
              <div>
                <FormGroup controlId='prestoCatalog'>
                  <ControlLabel>Catalog</ControlLabel>
                  <FormControl type='text' value={connection.prestoCatalog || ''} onChange={this.onPrestoCatalogChange} />
                </FormGroup>
                <FormGroup controlId='prestoSchema'>
                  <ControlLabel>Schema</ControlLabel>
                  <FormControl type='text' value={connection.prestoSchema || ''} onChange={this.onPrestoSchemaChange} />
                </FormGroup>
              </div>
            ) : null)}
            <Button style={{width: 100}} onClick={this.props.saveConnection} disabled={this.props.isSaving}>
              {this.props.isSaving ? 'Saving...' : 'Save'}
            </Button>
            {" "}
            <Button style={{width: 100}} onClick={this.props.testConnection} disabled={this.props.isTesting}>
              {this.props.isTesting ? 'Testing...' : 'Test'}
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
})
