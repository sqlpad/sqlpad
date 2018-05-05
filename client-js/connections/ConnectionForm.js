import React from 'react'
import PropTypes from 'prop-types'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Checkbox from 'react-bootstrap/lib/Checkbox'
import Button from 'react-bootstrap/lib/Button'
import fetchJson from '../utilities/fetch-json.js'

const TEXT = 'TEXT'
const PASSWORD = 'PASSWORD'
const CHECKBOX = 'CHECKBOX'

class ConnectionForm extends React.Component {
  state = {
    drivers: []
  }

  componentDidMount() {
    this.loadDriversFromServer()
  }

  // TODO move this to app load - no reason this will change
  loadDriversFromServer = () => {
    fetchJson('GET', '/api/drivers').then(json => {
      console.log(json)
      this.setState({ drivers: json.drivers })
    })
  }

  onTextInputChange = e => {
    this.props.setConnectionValue(e.target.name, e.target.value)
  }

  onCheckboxChange = e => {
    this.props.setConnectionValue(e.target.name, e.target.checked)
  }

  renderDriverFields() {
    const { selectedConnection } = this.props
    const { drivers } = this.state
    const connection = selectedConnection

    if (connection.driver && drivers.length) {
      // NOTE connection.driver is driverId
      const driver = drivers.find(driver => driver.id === connection.driver)

      if (!driver) {
        console.error(`Driver ${connection.driver} not found`)
        return null
      }

      const { fields } = driver
      return fields.map(field => {
        if (field.formType === TEXT) {
          const value = connection[field.key] || ''
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl
                type="text"
                name={field.key}
                value={value}
                onChange={this.onTextInputChange}
              />
            </FormGroup>
          )
        } else if (field.formType === PASSWORD) {
          const value = connection[field.key] || ''
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl
                type="password"
                autoComplete="new-password"
                name={field.key}
                value={value}
                onChange={this.onTextInputChange}
              />
            </FormGroup>
          )
        } else if (field.formType === CHECKBOX) {
          const checked = connection[field.key] || false
          return (
            <FormGroup key={field.key} controlId={field.key}>
              <Checkbox
                checked={checked}
                name={field.key}
                onChange={this.onCheckboxChange}
              >
                {field.label}
              </Checkbox>
            </FormGroup>
          )
        }
        return null
      })
    }
  }

  render() {
    const {
      selectedConnection,
      isSaving,
      isTesting,
      testConnection,
      saveConnection
    } = this.props
    const { drivers } = this.state

    const driverSelectOptions = [<option key="none" value="" />]

    if (!drivers.length) {
      driverSelectOptions.push(
        <option key="loading" value="">
          Loading...
        </option>
      )
    } else {
      drivers.sort((a, b) => a.name > b.name).forEach(driver =>
        driverSelectOptions.push(
          <option key={driver.id} value={driver.id}>
            {driver.name}
          </option>
        )
      )
    }

    const connection = selectedConnection
    return (
      <div>
        <Form>
          <FormGroup
            controlId="name"
            validationState={connection.name ? null : 'error'}
          >
            <ControlLabel>Connection Name</ControlLabel>
            <FormControl
              type="text"
              name="name"
              value={connection.name || ''}
              onChange={this.onTextInputChange}
            />
          </FormGroup>
          <FormGroup
            controlId="driver"
            validationState={connection.driver ? null : 'error'}
          >
            <ControlLabel>Database Driver</ControlLabel>
            <FormControl
              componentClass="select"
              name="driver"
              value={connection.driver || ''}
              onChange={this.onTextInputChange}
            >
              {driverSelectOptions}
            </FormControl>
          </FormGroup>
          {this.renderDriverFields()}
          <Button
            style={{ width: 100 }}
            onClick={saveConnection}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>{' '}
          <Button
            style={{ width: 100 }}
            onClick={testConnection}
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test'}
          </Button>
        </Form>
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
