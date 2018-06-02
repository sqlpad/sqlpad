import React from 'react'
import PropTypes from 'prop-types'
import fetchJson from '../utilities/fetch-json.js'

import Tag from 'antd/lib/tag'
import 'antd/lib/tag/style/css'

import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'

import Checkbox from 'antd/lib/checkbox'
import 'antd/lib/checkbox/style/css'

import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'

const FormItem = Form.Item
const { Option } = Select

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
      this.setState({ drivers: json.drivers })
    })
  }

  onTextInputChange = e => {
    this.props.setConnectionValue(e.target.name, e.target.value)
  }

  onCheckboxChange = e => {
    this.props.setConnectionValue(e.target.name, e.target.checked)
  }

  getSelectChangeHandler = fieldName => value =>
    this.props.setConnectionValue(fieldName, value)

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
            <FormItem key={field.key}>
              <label className="near-black">{field.label}</label>
              <Input
                name={field.key}
                value={value}
                onChange={this.onTextInputChange}
              />
            </FormItem>
          )
        } else if (field.formType === PASSWORD) {
          const value = connection[field.key] || ''
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <FormItem key={field.key}>
              <label className="near-black">{field.label}</label>
              <Input
                type="password"
                autoComplete="new-password"
                name={field.key}
                value={value}
                onChange={this.onTextInputChange}
              />
            </FormItem>
          )
        } else if (field.formType === CHECKBOX) {
          const checked = connection[field.key] || false
          return (
            <FormItem key={field.key}>
              <Checkbox
                checked={checked}
                name={field.key}
                onChange={this.onCheckboxChange}
              >
                {field.label}
              </Checkbox>
            </FormItem>
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
      saveConnection,
      testFailed,
      testSuccess
    } = this.props
    const { drivers } = this.state

    const driverSelectOptions = [<Option key="none" value="" />]

    if (!drivers.length) {
      driverSelectOptions.push(
        <Option key="loading" value="">
          Loading...
        </Option>
      )
    } else {
      drivers.sort((a, b) => a.name > b.name).forEach(driver =>
        driverSelectOptions.push(
          <Option key={driver.id} value={driver.id} name="driver">
            {driver.name}
          </Option>
        )
      )
    }

    const connection = selectedConnection
    return (
      <div>
        <Form layout="vertical">
          <FormItem validateStatus={connection.name ? null : 'error'}>
            <label className="near-black">Connection name</label>
            <Input
              name="name"
              value={connection.name || ''}
              onChange={this.onTextInputChange}
            />
          </FormItem>
          <FormItem validateStatus={connection.driver ? null : 'error'}>
            <label className="near-black">Driver</label>
            <Select
              name="driver"
              value={connection.driver || ''}
              onChange={this.getSelectChangeHandler('driver')}
            >
              {driverSelectOptions}
            </Select>
          </FormItem>
          {this.renderDriverFields()}
        </Form>
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
        {testSuccess && (
          <Tag className="ml2 b--dark-green bg-green white">Success</Tag>
        )}
        {testFailed && (
          <Tag className="ml2 b--dark-red bg-red white">Failed</Tag>
        )}
      </div>
    )
  }
}

ConnectionForm.propTypes = {
  isSaving: PropTypes.bool,
  isTesting: PropTypes.bool,
  saveConnection: PropTypes.func.isRequired,
  selectedConnection: PropTypes.object,
  testConnection: PropTypes.func.isRequired,
  testFailed: PropTypes.bool,
  testSuccess: PropTypes.bool
}

ConnectionForm.defaultProps = {
  isSaving: false,
  isTesting: false,
  selectedConnection: null,
  testFailed: false,
  testSuccess: false
}

export default ConnectionForm
