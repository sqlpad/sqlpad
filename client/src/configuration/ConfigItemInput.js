import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import React from 'react'

const { Option } = Select

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

  handleSelectChange = value => {
    this.setState({
      value
    })
    this.props.saveConfigValue(this.props.config.key, value)
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
          <Option key={option} value={option}>
            {option.toString()}
          </Option>
        )
      })
      return (
        <Select
          className="w-100"
          disabled={disabled}
          onChange={this.handleSelectChange}
          value={this.state.value}
        >
          {optionNodes}
        </Select>
      )
    } else {
      return (
        <Input
          className="w-100"
          disabled={disabled}
          onChange={this.handleChange}
          placeholder={config.label}
          value={this.state.value}
        />
      )
    }
  }
}

export default ConfigItemInput
