import React from 'react'
import fetchJson from './utilities/fetch-json.js'
import Alert from 'react-s-alert'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import HelpBlock from 'react-bootstrap/lib/HelpBlock'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import AutoAffix from 'react-overlays/lib/AutoAffix'
var _ = window._

const CheckListItem = (props) => {
  if (!props.configKey || !props.configItems || !props.configItems.length) {
    return null
  }
  var configItem = props.configItems.find((item) => {
    return item.key === props.configKey
  })
  if (!configItem) {
    return (
      <li style={{listStyle: 'none'}}>
        <strong>{props.configKey} is not in configItems.</strong>
      </li>
    )
  }
  return (
    <li style={{listStyle: 'none'}}>
      <Glyphicon glyph={configItem.effectiveValue ? 'ok' : 'remove'} /> {configItem.label || configItem.envVar}
    </li>
  )
}

var ConfigValues = React.createClass({
  loadConfigValuesFromServer: function () {
    fetchJson('GET', this.props.config.baseUrl + '/api/config-items')
      .then((json) => {
        if (json.error) Alert.error(json.error)
        this.setState({configItems: json.configItems})
      })
  },
  saveConfigValue: function (key, value) {
    fetchJson('POST', this.props.config.baseUrl + '/api/config-values/' + key, {value: value})
      .then((json) => {
        if (json.error) {
          Alert.error('Save failed')
        } else {
          Alert.success('Value saved')
          this.loadConfigValuesFromServer()
        }
      })
  },
  getInitialState: function () {
    return {
      configItems: []
    }
  },
  componentDidMount: function () {
    this.loadConfigValuesFromServer()
    this.saveConfigValue = _.debounce(this.saveConfigValue, 500)
  },
  render: function () {
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
      <div>
        <Col sm={6} smOffset={1}>
          <div className='configBox'>
            <h1 style={{textAlign: 'center'}}>Configuration</h1>
            <hr />
            <Form horizontal>
              {configItemInputNodes}
            </Form>
            <hr />
            <p>
              Some configuration is only accessible via environment variables
              or command-line-interface (CLI) flags. Below are the current values for these
              variables. Sensitive values are masked. Hover over input for additional information.
            </p>
            <hr />
            <ConfigEnvDocumentation configItems={this.state.configItems} />
          </div>
        </Col>
        <Col sm={3} smOffset={1} style={{paddingTop: 90}}>
          <AutoAffix viewportOffsetTop={95}>
            <div className='panel panel-default'>
              <div className='panel-body'>
                <p>
                  <strong>Feature Checklist</strong>
                </p>
                <p>
                  Unlock features by providing the required configuration.
                </p>
                <hr />
                <strong>Email</strong>
                <ul style={{paddingLeft: 20}}>
                  <CheckListItem configKey={'smtpUser'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'smtpHost'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'smtpPort'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'smtpFrom'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'publicUrl'} configItems={this.state.configItems} />
                </ul>
                <strong>Google OAuth</strong>
                <ul style={{paddingLeft: 20}}>
                  <CheckListItem configKey={'googleClientId'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'googleClientSecret'} configItems={this.state.configItems} />
                  <CheckListItem configKey={'publicUrl'} configItems={this.state.configItems} />
                </ul>
              </div>
            </div>
          </AutoAffix>
        </Col>
      </div>
    )
  }
})
export default ConfigValues

var ConfigItemInput = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.config.effectiveValue
    }
  },
  handleChange: function (e) {
    this.setState({
      value: e.target.value
    })
    this.props.saveConfigValue(this.props.config.key, e.target.value)
  },
  render: function () {
    const config = this.props.config
    const disabled = (config.effectiveValueSource === 'cli' || config.effectiveValueSource === 'saved cli' || config.effectiveValueSource === 'env')

    const effectiveValueSourceLabels = {
      'cli': 'Command Line',
      'saved cli': 'Saved Command Line',
      'env': 'Environment Varialbe'
    }
    const overriddenBy = effectiveValueSourceLabels[config.effectiveValueSource]

    const inputNode = () => {
      if (config.options) {
        var optionNodes = config.options.map(function (option) {
          return (
            <option key={option} value={option}>{option.toString()}</option>
          )
        })
        return (
          <FormControl
            componentClass='select'
            value={this.state.value}
            disabled={disabled}
            onChange={this.handleChange} >
            {optionNodes}
          </FormControl>
        )
      } else {
        return (
          <FormControl
            type='text'
            value={this.state.value}
            disabled={disabled}
            placeholder={config.label}
            onChange={this.handleChange}
            />
        )
      }
    }

    var defaultValue = () => {
      if (config.default === '') {
        return (
          <em style={{color: '#999'}}>empty</em>
        )
      }
      return (
        <span>{config.default.toString()}</span>
      )
    }

    var cliFlag = (config.cliFlag && config.cliFlag.pop ? config.cliFlag.pop() : config.cliFlag)

    var helpPopover = (
      <Popover id='popover-trigger-focus' title={config.label}>
        <HelpBlock>{config.description}</HelpBlock>
        <HelpBlock>
          <strong>Default:</strong> {defaultValue()}
        </HelpBlock>
        {(cliFlag ? (
          <HelpBlock>
            <strong>CLI Flag:</strong> --{cliFlag}
          </HelpBlock>
        ) : null)}
        {(config.envVar ? (
          <HelpBlock>
            <strong>Environment Variable:</strong> {config.envVar}
          </HelpBlock>
        ) : null)}
        {(disabled ? (
          <div>
            <HelpBlock>
              <strong>Set By:</strong> {overriddenBy}
            </HelpBlock>
            <HelpBlock>
              When set by command line or environment, item is not configurable via UI.
            </HelpBlock>
          </div>
        ) : null)}
      </Popover>
    )

    return (
      <FormGroup controlId={config.configKey}>
        <Col componentClass={ControlLabel} sm={6}>
          {config.label}
        </Col>
        <Col sm={6}>
          <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={helpPopover}>
            {inputNode()}
          </OverlayTrigger>
        </Col>
      </FormGroup>
    )
  }
})

var ConfigEnvDocumentation = React.createClass({
  render: function () {
    var configNodes = this.props.configItems
      .filter(config => config.interface === 'env')
      .map(function (config) {
        var defaultValue = () => {
          if (config.default === '') {
            return (
              <em style={{color: '#999'}}>empty</em>
            )
          }
          return (
            <span>{config.default.toString()}</span>
          )
        }
        var currentValue = (config.value === '' ? '<empty>' : config.effectiveValue.toString())
        var cliFlag = (config.cliFlag && config.cliFlag.pop ? config.cliFlag.pop() : config.cliFlag)
        var helpPopover = (
          <Popover id='popover-trigger-focus' title={config.envVar}>
            <HelpBlock>
              <p>
                {config.description}
              </p>
              <p>
                <strong>Default:</strong> {defaultValue()}
              </p>
              {(cliFlag ? (
                <p>
                  <strong>CLI Flag:</strong> --{cliFlag}
                </p>
              ) : null)}
              <p>
                <strong>Environment Variable:</strong> {config.envVar}
              </p>
              <p>
                <strong>Set By:</strong> {config.effectiveValueSource}
              </p>
            </HelpBlock>
          </Popover>
        )
        return (
          <Row key={config.key} style={{marginTop: 30}}>
            <Col componentClass={ControlLabel} sm={6}>
              {config.envVar}
            </Col>
            <Col sm={6}>
              <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={helpPopover}>
                <FormControl
                  type='text'
                  value={currentValue}
                  disabled />
              </OverlayTrigger>
            </Col>
          </Row>
        )
      })
    return (
      <Form horizontal style={{marginBottom: 50}}>
        {configNodes}
      </Form>
    )
  }
})
