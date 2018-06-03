import React from 'react'
import FormControl from 'react-bootstrap/lib/FormControl'

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
    const { config } = this.props
    const disabled =
      config.effectiveValueSource === 'cli' ||
      config.effectiveValueSource === 'saved cli' ||
      config.effectiveValueSource === 'env'

    if (config.options) {
      const optionNodes = config.options.map(option => {
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
}

export default ConfigItemInput
