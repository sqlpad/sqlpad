import React from 'react'
import message from 'antd/lib/message'
import Form from 'react-bootstrap/lib/Form'
import debounce from 'lodash.debounce'
import CheckListItem from './CheckListItem'
import ConfigEnvDocumentation from './ConfigEnvDocumentation'
import ConfigItemInput from './ConfigItemInput'
import fetchJson from '../utilities/fetch-json.js'

import Col from 'antd/lib/col'
import 'antd/lib/col/style/css'

import Row from 'antd/lib/row'
import 'antd/lib/row/style/css'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'

const { Header, Content } = Layout
const { Column } = Table

class ConfigurationView extends React.Component {
  state = {
    configItems: []
  }

  loadConfigValuesFromServer = () => {
    fetchJson('GET', '/api/config-items').then(json => {
      if (json.error) message.error(json.error)
      this.setState({ configItems: json.configItems })
    })
  }

  saveConfigValue = (key, value) => {
    fetchJson('POST', '/api/config-values/' + key, {
      value: value
    }).then(json => {
      if (json.error) {
        message.error('Save failed')
      } else {
        message.success('Value saved')
        this.loadConfigValuesFromServer()
      }
    })
  }

  componentDidMount() {
    document.title = 'SQLPad - Configuration'
    this.loadConfigValuesFromServer()
    this.saveConfigValue = debounce(this.saveConfigValue, 500)
  }

  renderValueInput = (text, record) => {
    return (
      <ConfigItemInput
        key={record.key}
        config={record}
        saveConfigValue={this.saveConfigValue}
      />
    )
  }

  renderInfo = (text, config) => {
    const disabled =
      config.effectiveValueSource === 'cli' ||
      config.effectiveValueSource === 'saved cli' ||
      config.effectiveValueSource === 'env'

    const effectiveValueSourceLabels = {
      cli: 'Command Line',
      'saved cli': 'Saved Command Line',
      env: 'Environment Varialbe'
    }
    const overriddenBy = effectiveValueSourceLabels[config.effectiveValueSource]

    const defaultValue =
      config.default === '' ? (
        <em style={{ color: '#999' }}>empty</em>
      ) : (
        <span>{config.default.toString()}</span>
      )

    const cliFlag =
      config.cliFlag && config.cliFlag.pop
        ? config.cliFlag.pop()
        : config.cliFlag

    return (
      <div style={{ width: '300px' }}>
        <p>{config.description}</p>
        <p>
          <strong>Default:</strong> {defaultValue}
        </p>
        {cliFlag && (
          <p>
            <strong>CLI Flag:</strong> --{cliFlag}
          </p>
        )}
        {config.envVar && (
          <p>
            <strong>Environment Variable:</strong> {config.envVar}
          </p>
        )}
        {disabled && (
          <div>
            <p>
              <strong>Set By:</strong> {overriddenBy}
            </p>
            <p>
              When set by command line or environment, item is not configurable
              via UI.
            </p>
          </div>
        )}
      </div>
    )
  }

  renderConfigInputs() {
    const { configItems } = this.state
    const uiConfigItems = configItems.filter(
      config => config.interface === 'ui'
    )
    return (
      <Table
        className="bg-white w-100"
        locale={{ emptyText: 'No connections found' }}
        dataSource={uiConfigItems}
        pagination={false}
      >
        <Column title="Setting" key="envVar" dataIndex="label" />
        <Column title="Value" key="value" render={this.renderValueInput} />
        <Column title="Info" key="info" render={this.renderInfo} />
      </Table>
    )
  }

  render() {
    return (
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header className=" pr4 pl4">
          <div className="f1 fl white">Configuration</div>
        </Header>
        <Content className="ma4">
          <Row gutter={16}>
            <Col span={16}>
              <Form horizontal>{this.renderConfigInputs()}</Form>
            </Col>
            <Col span={8}>
              <div className="bg-white ba br2 b--light-gray pa4">
                <p>
                  <strong>Feature Checklist</strong>
                </p>
                <p>Unlock features by providing the required configuration.</p>
                <hr />
                <strong>Email</strong>
                <ul style={{ paddingLeft: 20 }}>
                  <CheckListItem
                    configKey={'smtpUser'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'smtpHost'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'smtpPort'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'smtpFrom'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'publicUrl'}
                    configItems={this.state.configItems}
                  />
                </ul>
                <strong>Google OAuth</strong>
                <ul style={{ paddingLeft: 20 }}>
                  <CheckListItem
                    configKey={'googleClientId'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'googleClientSecret'}
                    configItems={this.state.configItems}
                  />
                  <CheckListItem
                    configKey={'publicUrl'}
                    configItems={this.state.configItems}
                  />
                </ul>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <hr />
              <p>
                Some configuration is only accessible via environment variables
                or command-line-interface (CLI) flags. Below are the current
                values for these variables. Sensitive values are masked. Hover
                over input for additional information.
              </p>
              <hr />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <ConfigEnvDocumentation configItems={this.state.configItems} />
            </Col>
          </Row>
        </Content>
      </Layout>
    )
  }
}

export default ConfigurationView
