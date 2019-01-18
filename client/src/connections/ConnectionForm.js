import Button from 'antd/lib/button'
import Checkbox from 'antd/lib/checkbox'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import React from 'react'
import fetchJson from '../utilities/fetch-json.js'

const FormItem = Form.Item
const { Option } = Select

const TEXT = 'TEXT'
const PASSWORD = 'PASSWORD'
const CHECKBOX = 'CHECKBOX'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
}

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
}

class ConnectionForm extends React.Component {
  state = {
    connectionEdits: {},
    drivers: [],
    saving: false,
    savingError: null,
    testFailed: false,
    testing: false,
    testSuccess: false,
    title: '',
    visible: false
  }

  componentDidMount() {
    this.loadDriversFromServer()
    this.loadConnectionFromServer()
  }

  // TODO move this to app load - no reason this will change
  loadDriversFromServer = () => {
    fetchJson('GET', '/api/drivers').then(json => {
      this.setState({ drivers: json.drivers })
    })
  }

  loadConnectionFromServer = async () => {
    const { connectionId } = this.props
    if (connectionId) {
      const json = await fetchJson('GET', `/api/connections/${connectionId}`)
      if (json.error) {
        return console.error(json.error)
      }
      return this.setState({ connectionEdits: json.connection })
    }
  }

  setConnectionValue = (key, value) => {
    const { connectionEdits } = this.state
    connectionEdits[key] = value
    return this.setState({ connectionEdits })
  }

  testConnection = async () => {
    const { connectionEdits } = this.state
    this.setState({ testing: true })
    const json = await fetchJson(
      'POST',
      '/api/test-connection',
      connectionEdits
    )
    return this.setState({
      testing: false,
      testFailed: json.error ? true : false,
      testSuccess: json.error ? false : true
    })
  }

  saveConnection = async () => {
    const { saving, connectionEdits } = this.state
    const { onConnectionSaved } = this.props
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
      return this.setState({ saving: false, savingError: json.error })
    }
    return onConnectionSaved(json.connection)
  }

  renderDriverFields() {
    const { drivers, connectionEdits } = this.state

    if (connectionEdits.driver && drivers.length) {
      // NOTE connection.driver is driverId
      const driver = drivers.find(
        driver => driver.id === connectionEdits.driver
      )

      if (!driver) {
        console.error(`Driver ${connectionEdits.driver} not found`)
        return null
      }

      const { fields } = driver
      return fields.map(field => {
        if (field.formType === TEXT) {
          const value = connectionEdits[field.key] || ''
          return (
            <FormItem {...formItemLayout} key={field.key} label={field.label}>
              {/* <label className="near-black">{field.label}</label> */}
              <Input
                name={field.key}
                value={value}
                onChange={e =>
                  this.setConnectionValue(e.target.name, e.target.value)
                }
              />
            </FormItem>
          )
        } else if (field.formType === PASSWORD) {
          const value = connectionEdits[field.key] || ''
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <FormItem {...formItemLayout} key={field.key} label={field.label}>
              {/* <label className="near-black">{field.label}</label> */}
              <Input
                type="password"
                autoComplete="new-password"
                name={field.key}
                value={value}
                onChange={e =>
                  this.setConnectionValue(e.target.name, e.target.value)
                }
              />
            </FormItem>
          )
        } else if (field.formType === CHECKBOX) {
          const checked = connectionEdits[field.key] || false
          return (
            <FormItem {...tailFormItemLayout} key={field.key}>
              <Checkbox
                checked={checked}
                name={field.key}
                onChange={e =>
                  this.setConnectionValue(e.target.name, e.target.checked)
                }
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
      drivers,
      connectionEdits,
      saving,
      testing,
      testSuccess,
      testFailed
    } = this.state

    const { name = '', driver = '' } = connectionEdits

    const driverSelectOptions = [<Option key="none" value="" />]

    if (!drivers.length) {
      driverSelectOptions.push(
        <Option key="loading" value="">
          Loading...
        </Option>
      )
    } else {
      drivers
        .sort((a, b) => a.name > b.name)
        .forEach(driver =>
          driverSelectOptions.push(
            <Option key={driver.id} value={driver.id} name="driver">
              {driver.name}
            </Option>
          )
        )
    }

    return (
      <div style={{ height: '100%' }}>
        <Form
          layout="vertical"
          autoComplete="off"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <div style={{ overflowY: 'auto', flexGrow: 1, height: '100%' }}>
            <FormItem
              {...formItemLayout}
              validateStatus={name ? null : 'error'}
              label={'Connection name'}
            >
              <Input
                name="name"
                value={name}
                onChange={e =>
                  this.setConnectionValue(e.target.name, e.target.value)
                }
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Driver"
              validateStatus={driver ? null : 'error'}
            >
              <Select
                name="driver"
                value={driver}
                onChange={value => this.setConnectionValue('driver', value)}
              >
                {driverSelectOptions}
              </Select>
            </FormItem>

            {this.renderDriverFields()}
          </div>
          <div
            style={{
              borderTop: '1px solid #e8e8e8',
              paddingTop: '22px',
              textAlign: 'right'
            }}
          >
            <Button
              style={{ width: 120 }}
              type="primary"
              onClick={this.saveConnection}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>{' '}
            <Button
              style={{ width: 120 }}
              onClick={this.testConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test'}
              {!testing && testSuccess && (
                <Icon
                  type="check-circle"
                  theme="twoTone"
                  twoToneColor="#52c41a"
                />
              )}
              {!testing && testFailed && (
                <Icon
                  type="close-circle"
                  theme="twoTone"
                  twoToneColor="#eb2f96"
                />
              )}
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

export default ConnectionForm
