import Button from 'antd/lib/button'
import Checkbox from 'antd/lib/checkbox'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Tag from 'antd/lib/tag'
import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionEditContainer from '../containers/ConnectionEditContainer'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import fetchJson from '../utilities/fetch-json.js'

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

  renderDriverFields(connectionEdits, setConnectionValue) {
    const { drivers } = this.state

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
            <FormItem key={field.key}>
              <label className="near-black">{field.label}</label>
              <Input
                name={field.key}
                value={value}
                onChange={e =>
                  setConnectionValue(e.target.name, e.target.value)
                }
              />
            </FormItem>
          )
        } else if (field.formType === PASSWORD) {
          const value = connectionEdits[field.key] || ''
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
                onChange={e =>
                  setConnectionValue(e.target.name, e.target.value)
                }
              />
            </FormItem>
          )
        } else if (field.formType === CHECKBOX) {
          const checked = connectionEdits[field.key] || false
          return (
            <FormItem key={field.key}>
              <Checkbox
                checked={checked}
                name={field.key}
                onChange={e =>
                  setConnectionValue(e.target.name, e.target.checked)
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

    return (
      <Subscribe to={[ConnectionsContainer, ConnectionEditContainer]}>
        {(connectionsContainer, connectionEditContainer) => {
          const {
            connectionEdits,
            saving,
            testing,
            testSuccess,
            testFailed
          } = connectionEditContainer.state
          const {
            setConnectionValue,
            testConnection,
            saveConnection
          } = connectionEditContainer

          const { name = '', driver = '' } = connectionEdits

          return (
            <div>
              <Form layout="vertical" autoComplete="off">
                <FormItem validateStatus={name ? null : 'error'}>
                  <label className="near-black">Connection name</label>
                  <Input
                    name="name"
                    value={name}
                    onChange={e =>
                      setConnectionValue(e.target.name, e.target.value)
                    }
                  />
                </FormItem>
                <FormItem validateStatus={driver ? null : 'error'}>
                  <label className="near-black">Driver</label>
                  <Select
                    name="driver"
                    value={driver}
                    onChange={value => setConnectionValue('driver', value)}
                  >
                    {driverSelectOptions}
                  </Select>
                </FormItem>
                {this.renderDriverFields(connectionEdits, setConnectionValue)}
              </Form>
              <Button
                style={{ width: 100 }}
                onClick={async () => {
                  const { connection, error } = await saveConnection()
                  if (!error) {
                    connectionsContainer.addUpdateConnection(connection)
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>{' '}
              <Button
                style={{ width: 100 }}
                onClick={() => testConnection(connectionEdits)}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test'}
              </Button>
              {testSuccess && (
                <Tag className="ml2 b--dark-green bg-green white">Success</Tag>
              )}
              {testFailed && (
                <Tag className="ml2 b--dark-red bg-red white">Failed</Tag>
              )}
            </div>
          )
        }}
      </Subscribe>
    )
  }
}

export default ConnectionForm
