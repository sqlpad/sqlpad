import React from 'react'
import PropTypes from 'prop-types'
import Panel from 'react-bootstrap/lib/Panel'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Checkbox from 'react-bootstrap/lib/Checkbox'
import Button from 'react-bootstrap/lib/Button'

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
  postgresCA: {
    key: 'postgresCA',
    formType: TEXT,
    label: 'Database CA Path'
  },
  useSocks: {
    key: 'useSocks',
    formType: CHECKBOX,
    label: 'Connect through SOCKS proxy'
  },
  socksHost: {
    key: 'socksHost',
    formType: TEXT,
    label: 'Proxy hostname'
  },
  socksPort: {
    key: 'socksPort',
    formType: TEXT,
    label: 'Proxy port'
  },
  socksUsername: {
    key: 'socksUsername',
    formType: TEXT,
    label: 'Username for socks proxy'
  },
  socksPassword: {
    key: 'socksPassword',
    formType: TEXT,
    label: 'Password for socks proxy'
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
    fields.postgresKey,
    fields.postgresCA,
    fields.useSocks,
    fields.socksHost,
    fields.socksPort,
    fields.socksUsername,
    fields.socksPassword
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
  selectedConnection: PropTypes.object,
  testConnection: PropTypes.func.isRequired,
  saveConnection: PropTypes.func.isRequired,
  isTesting: PropTypes.bool,
  isSaving: PropTypes.bool
}

ConnectionForm.defaultProps = {
  isTesting: false,
  isSaving: false,
  selectedConnection: null
}

export default ConnectionForm
