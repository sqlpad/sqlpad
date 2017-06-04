import React from 'react'
import chartDefinitions from './ChartDefinitions.js'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Checkbox from 'react-bootstrap/lib/Checkbox'
const _ = window._

function cleanBoolean (value) {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      value = true
    } else if (value.toLowerCase() === 'false') {
      value = false
    }
  }
  return value
}

var ChartInputs = React.createClass({
  getInitialState: function () {
    return {
      showAdvanced: false
    }
  },
  toggleAdvanced: function () {
    this.setState({
      showAdvanced: !this.state.showAdvanced
    })
  },
  changeChartConfigurationField: function (chartFieldId, queryResultField) {
    this.props.onChartConfigurationFieldsChange(chartFieldId, queryResultField)
  },
  render: function () {
    var queryChartConfigurationFields = this.props.queryChartConfigurationFields || {}
    var queryResult = this.props.queryResult
    var queryResultFields = (queryResult && queryResult.fields ? queryResult.fields : [])
    var chartInputDefinition = _.findWhere(chartDefinitions, {chartType: this.props.chartType})

    if (!chartInputDefinition || !chartInputDefinition.fields) return null

    var regularInputDefinitionFields = chartInputDefinition.fields.filter((field) => {
      return (field.advanced == null || field.advanced === false)
    })

    var advancedInputDefinitionFields = chartInputDefinition.fields.filter((field) => {
      return field.advanced === true
    })

    var showAdvancedLink = (advancedInputDefinitionFields.length
                ? <a href='#settings' onClick={this.toggleAdvanced}>{this.state.showAdvanced ? 'hide advanced settings' : 'show advanced settings'}</a>
                : null)

    var formGroupNodes = (inputDefinitionFields) => {
      return inputDefinitionFields.map((field) => {
        if (field.inputType === 'field-dropdown') {
          var optionNodes = queryResultFields.map(function (qrfield) {
            return (
              <option key={qrfield} value={qrfield}>{qrfield}</option>
            )
          })
          var selectedQueryResultField = queryChartConfigurationFields[field.fieldId]
          if (queryResultFields.indexOf(selectedQueryResultField) === -1) {
            optionNodes.push(function () {
              return (
                <option key={'selectedQueryResultField'} value={selectedQueryResultField}>{selectedQueryResultField}</option>
              )
            }())
          }
          return (
            <FormGroup key={field.fieldId} controlId={field.fieldId} bsSize='small'>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl
                value={selectedQueryResultField}
                onChange={(e) => {
                  this.changeChartConfigurationField(field.fieldId, e.target.value)
                }}
                componentClass='select'
                className='input-small'>
                <option value='' />
                {optionNodes}
              </FormControl>
            </FormGroup>
          )
        } else if (field.inputType === 'checkbox') {
          var checked = cleanBoolean(queryChartConfigurationFields[field.fieldId]) || false
          return (
            <FormGroup key={field.fieldId} controlId={field.fieldId} bsSize='small'>
              <Checkbox
                checked={checked}
                onChange={(e) => {
                  this.changeChartConfigurationField(field.fieldId, e.target.checked)
                }}>
                {field.label}
              </Checkbox>
            </FormGroup>
          )
        } else if (field.inputType === 'textbox') {
          var value = queryChartConfigurationFields[field.fieldId]
          return (
            <FormGroup key={field.fieldId} controlId={field.fieldId} bsSize='small'>
              <ControlLabel>{field.label}</ControlLabel>
              <FormControl
                value={(value == null ? '' : value)}
                onChange={(e) => {
                  this.changeChartConfigurationField(field.fieldId, e.target.value)
                }}
                type='text'
                className='input-small' />
            </FormGroup>
          )
        } else {
          throw Error(`field.inputType ${field.inputType} not supported`)
        }
      })
    }

    var advancedFormGroup = () => {
      if (this.state.showAdvanced) return formGroupNodes(advancedInputDefinitionFields)
      else return null
    }

    return (
      <div>
        {formGroupNodes(regularInputDefinitionFields)}
        {showAdvancedLink}
        {advancedFormGroup()}
      </div>
    )
  }
})

export default ChartInputs
