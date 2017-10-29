import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Form from 'react-bootstrap/lib/Form'
import FormControl from 'react-bootstrap/lib/FormControl'
import HelpBlock from 'react-bootstrap/lib/HelpBlock'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Popover from 'react-bootstrap/lib/Popover'
import Row from 'react-bootstrap/lib/Row'

class ConfigEnvDocumentation extends React.Component {
  render() {
    var configNodes = this.props.configItems
      .filter(config => config.interface === 'env')
      .map(function(config) {
        var defaultValue = () => {
          if (config.default === '') {
            return <em style={{ color: '#999' }}>empty</em>
          }
          return <span>{config.default.toString()}</span>
        }
        var currentValue =
          config.value === '' ? '<empty>' : config.effectiveValue.toString()
        var cliFlag =
          config.cliFlag && config.cliFlag.pop
            ? config.cliFlag.pop()
            : config.cliFlag
        var helpPopover = (
          <Popover id="popover-trigger-focus" title={config.envVar}>
            <HelpBlock>
              <p>{config.description}</p>
              <p>
                <strong>Default:</strong> {defaultValue()}
              </p>
              {cliFlag ? (
                <p>
                  <strong>CLI Flag:</strong> --{cliFlag}
                </p>
              ) : null}
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
          <Row key={config.key} style={{ marginTop: 30 }}>
            <Col componentClass={ControlLabel} sm={6}>
              {config.envVar}
            </Col>
            <Col sm={6}>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="right"
                overlay={helpPopover}
              >
                <FormControl type="text" value={currentValue} disabled />
              </OverlayTrigger>
            </Col>
          </Row>
        )
      })
    return (
      <Form horizontal style={{ marginBottom: 50 }}>
        {configNodes}
      </Form>
    )
  }
}

export default ConfigEnvDocumentation
