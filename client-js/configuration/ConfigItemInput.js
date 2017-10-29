import React from 'react'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Col from 'react-bootstrap/lib/Col'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import HelpBlock from 'react-bootstrap/lib/HelpBlock'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

class ConfigItemInput extends React.Component {
  state = {
    value: this.props.config.effectiveValue
  }

  handleChange = e => {
    this.setState({
      value: e.target.value
    })
    this.props.saveConfigValue(this.props.config.key, e.target.value)
  }

  render() {
    const config = this.props.config
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

    const inputNode = () => {
      if (config.options) {
        var optionNodes = config.options.map(function(option) {
          return (
            <option key={option} value={option}>
              {option.toString()}
            </option>
          )
        })
        return (
          <FormControl
            componentClass="select"
            value={this.state.value}
            disabled={disabled}
            onChange={this.handleChange}
          >
            {optionNodes}
          </FormControl>
        )
      } else {
        return (
          <FormControl
            type="text"
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
        return <em style={{ color: '#999' }}>empty</em>
      }
      return <span>{config.default.toString()}</span>
    }

    var cliFlag =
      config.cliFlag && config.cliFlag.pop
        ? config.cliFlag.pop()
        : config.cliFlag

    var helpPopover = (
      <Popover id="popover-trigger-focus" title={config.label}>
        <HelpBlock>{config.description}</HelpBlock>
        <HelpBlock>
          <strong>Default:</strong> {defaultValue()}
        </HelpBlock>
        {cliFlag ? (
          <HelpBlock>
            <strong>CLI Flag:</strong> --{cliFlag}
          </HelpBlock>
        ) : null}
        {config.envVar ? (
          <HelpBlock>
            <strong>Environment Variable:</strong> {config.envVar}
          </HelpBlock>
        ) : null}
        {disabled ? (
          <div>
            <HelpBlock>
              <strong>Set By:</strong> {overriddenBy}
            </HelpBlock>
            <HelpBlock>
              When set by command line or environment, item is not configurable
              via UI.
            </HelpBlock>
          </div>
        ) : null}
      </Popover>
    )

    return (
      <FormGroup controlId={config.configKey}>
        <Col componentClass={ControlLabel} sm={6}>
          {config.label}
        </Col>
        <Col sm={6}>
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="right"
            overlay={helpPopover}
          >
            {inputNode()}
          </OverlayTrigger>
        </Col>
      </FormGroup>
    )
  }
}

export default ConfigItemInput
