import React from 'react'
import message from 'antd/lib/message'
import Col from 'react-bootstrap/lib/Col'
import Form from 'react-bootstrap/lib/Form'
import debounce from 'lodash.debounce'
import CheckListItem from './CheckListItem'
import ConfigEnvDocumentation from './ConfigEnvDocumentation'
import ConfigItemInput from './ConfigItemInput'
import fetchJson from '../utilities/fetch-json.js'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

const { Header, Content } = Layout

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

  render() {
    var configItemInputNodes = this.state.configItems
      .filter(config => config.interface === 'ui')
      .map(config => {
        return (
          <ConfigItemInput
            key={config.key}
            config={config}
            saveConfigValue={this.saveConfigValue}
          />
        )
      })
    return (
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header className=" pr4 pl4">
          <div className="f1 fl white">Configuration</div>
        </Header>
        <Content className="ma4">
          <div className="bg-white">
            <Col sm={6} smOffset={1}>
              <div className="configBox">
                <Form horizontal>{configItemInputNodes}</Form>
                <hr />
                <p>
                  Some configuration is only accessible via environment
                  variables or command-line-interface (CLI) flags. Below are the
                  current values for these variables. Sensitive values are
                  masked. Hover over input for additional information.
                </p>
                <hr />
                <ConfigEnvDocumentation configItems={this.state.configItems} />
              </div>
            </Col>
            <Col sm={3} smOffset={1}>
              <div className="panel panel-default">
                <div className="panel-body">
                  <p>
                    <strong>Feature Checklist</strong>
                  </p>
                  <p>
                    Unlock features by providing the required configuration.
                  </p>
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
              </div>
            </Col>
          </div>
        </Content>
      </Layout>
    )
  }
}

export default ConfigurationView
