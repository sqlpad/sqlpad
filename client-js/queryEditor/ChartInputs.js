import React from 'react'
import PropTypes from 'prop-types'
import chartDefinitions from '../utilities/chartDefinitions.js'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Checkbox from 'react-bootstrap/lib/Checkbox'

function cleanBoolean(value) {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      value = true
    } else if (value.toLowerCase() === 'false') {
      value = false
    }
  }
  return value
}

class ChartInputs extends React.Component {
  state = {
    showAdvanced: false
  }

  handleAdvancedClick = e => {
    e.preventDefault()
    this.setState({
      showAdvanced: !this.state.showAdvanced
    })
  }

  changeChartConfigurationField = (chartFieldId, queryResultField) => {
    this.props.onChartConfigurationFieldsChange(chartFieldId, queryResultField)
  }

  renderFormGroup(inputDefinitionFields) {
    const { queryChartConfigurationFields, queryResult } = this.props
    const queryResultFields = queryResult.fields || []

    return inputDefinitionFields.map(field => {
      if (field.inputType === 'field-dropdown') {
        const optionNodes = queryResultFields.map(qrfield => {
          return (
            <option key={qrfield} value={qrfield}>
              {qrfield}
            </option>
          )
        })
        const selectedQueryResultField =
          queryChartConfigurationFields[field.fieldId]
        if (queryResultFields.indexOf(selectedQueryResultField) === -1) {
          optionNodes.push(
            <option
              key={'selectedQueryResultField'}
              value={selectedQueryResultField}
            >
              {selectedQueryResultField}
            </option>
          )
        }
        return (
          <FormGroup
            key={field.fieldId}
            controlId={field.fieldId}
            bsSize="small"
          >
            <ControlLabel>{field.label}</ControlLabel>
            <FormControl
              value={selectedQueryResultField}
              onChange={e => {
                this.changeChartConfigurationField(
                  field.fieldId,
                  e.target.value
                )
              }}
              componentClass="select"
              className="input-small"
            >
              <option value="" />
              {optionNodes}
            </FormControl>
          </FormGroup>
        )
      } else if (field.inputType === 'checkbox') {
        const checked =
          cleanBoolean(queryChartConfigurationFields[field.fieldId]) || false
        return (
          <FormGroup
            key={field.fieldId}
            controlId={field.fieldId}
            bsSize="small"
          >
            <Checkbox
              checked={checked}
              onChange={e => {
                this.changeChartConfigurationField(
                  field.fieldId,
                  e.target.checked
                )
              }}
            >
              {field.label}
            </Checkbox>
          </FormGroup>
        )
      } else if (field.inputType === 'textbox') {
        const value = queryChartConfigurationFields[field.fieldId] || ''
        return (
          <FormGroup
            key={field.fieldId}
            controlId={field.fieldId}
            bsSize="small"
          >
            <ControlLabel>{field.label}</ControlLabel>
            <FormControl
              value={value}
              onChange={e => {
                this.changeChartConfigurationField(
                  field.fieldId,
                  e.target.value
                )
              }}
              type="text"
              className="input-small"
            />
          </FormGroup>
        )
      } else {
        throw Error(`field.inputType ${field.inputType} not supported`)
      }
    })
  }

  render() {
    const { chartType } = this.props
    const { showAdvanced } = this.state

    const chartDefinition = chartDefinitions.find(
      def => def.chartType === chartType
    )

    if (!chartDefinition || !chartDefinition.fields) {
      return null
    }

    const regularFields = chartDefinition.fields.filter(
      field => field.advanced == null || field.advanced === false
    )

    const advancedFields = chartDefinition.fields.filter(
      field => field.advanced === true
    )

    const advancedLink = advancedFields.length ? (
      <a href="#settings" onClick={this.handleAdvancedClick}>
        {showAdvanced ? 'hide advanced settings' : 'show advanced settings'}
      </a>
    ) : null

    return (
      <div>
        {this.renderFormGroup(regularFields)}
        {advancedLink}
        {showAdvanced && this.renderFormGroup(advancedFields)}
      </div>
    )
  }
}

ChartInputs.propTypes = {
  chartType: PropTypes.string,
  onChartConfigurationFieldsChange: PropTypes.func.isRequired,
  queryChartConfigurationFields: PropTypes.object,
  queryResult: PropTypes.object
}

ChartInputs.defaultProps = {
  queryChartConfigurationFields: {},
  queryResult: {}
}

export default ChartInputs
