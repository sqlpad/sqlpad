import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import chartDefinitions from '../utilities/chartDefinitions.js';

function cleanBoolean(value) {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      value = true;
    } else if (value.toLowerCase() === 'false') {
      value = false;
    }
  }
  return value;
}

const inputStyle = {
  marginTop: 16,
  marginBottom: 16
};

function ChartInputs({
  onChartConfigurationFieldsChange,
  queryChartConfigurationFields,
  queryResult,
  chartType
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdvancedClick = e => {
    e.preventDefault();
    setShowAdvanced(!showAdvanced);
  };

  const changeChartConfigurationField = (chartFieldId, queryResultField) => {
    onChartConfigurationFieldsChange(chartFieldId, queryResultField);
  };

  const renderFormGroup = inputDefinitionFields => {
    const queryResultFields = queryResult.fields || [];

    return inputDefinitionFields.map(field => {
      if (field.inputType === 'field-dropdown') {
        const optionNodes = queryResultFields.map(qrfield => {
          return (
            <option key={qrfield} value={qrfield}>
              {qrfield}
            </option>
          );
        });
        const selectedQueryResultField =
          queryChartConfigurationFields[field.fieldId];
        if (
          selectedQueryResultField &&
          queryResultFields.indexOf(selectedQueryResultField) === -1
        ) {
          optionNodes.push(
            <option
              key={'selectedQueryResultField'}
              value={selectedQueryResultField}
            >
              {selectedQueryResultField}
            </option>
          );
        }
        return (
          <div style={inputStyle} key={field.fieldId}>
            <label>{field.label}</label>
            <Select
              className="w-100"
              value={selectedQueryResultField}
              onChange={event =>
                changeChartConfigurationField(field.fieldId, event.target.value)
              }
            >
              <option value="" />
              {optionNodes}
            </Select>
          </div>
        );
      } else if (field.inputType === 'checkbox') {
        const checked =
          cleanBoolean(queryChartConfigurationFields[field.fieldId]) || false;
        console.log(field);
        return (
          <div style={inputStyle} key={field.fieldId}>
            <input
              type="checkbox"
              checked={checked}
              id={field.fieldId}
              name={field.fieldId}
              onChange={e =>
                changeChartConfigurationField(field.fieldId, e.target.checked)
              }
            />
            <label for={field.fieldId} style={{ marginLeft: 8 }}>
              {field.label}
            </label>
          </div>
        );
      } else if (field.inputType === 'textbox') {
        const value = queryChartConfigurationFields[field.fieldId] || '';
        return (
          <div style={inputStyle} key={field.fieldId}>
            <label>{field.label}</label>
            <Input
              value={value}
              onChange={e =>
                changeChartConfigurationField(field.fieldId, e.target.value)
              }
              className="w-100"
            />
          </div>
        );
      } else {
        throw Error(`field.inputType ${field.inputType} not supported`);
      }
    });
  };

  const chartDefinition = chartDefinitions.find(
    def => def.chartType === chartType
  );

  if (!chartDefinition || !chartDefinition.fields) {
    return null;
  }

  const regularFields = chartDefinition.fields.filter(
    field => field.advanced == null || field.advanced === false
  );

  const advancedFields = chartDefinition.fields.filter(
    field => field.advanced === true
  );

  const advancedLink = advancedFields.length ? (
    <a href="#settings" onClick={handleAdvancedClick}>
      {showAdvanced ? 'hide advanced settings' : 'show advanced settings'}
    </a>
  ) : null;

  return (
    <div>
      {renderFormGroup(regularFields)}
      {advancedLink}
      {showAdvanced && renderFormGroup(advancedFields)}
    </div>
  );
}

ChartInputs.propTypes = {
  chartType: PropTypes.string,
  onChartConfigurationFieldsChange: PropTypes.func.isRequired,
  queryChartConfigurationFields: PropTypes.object,
  queryResult: PropTypes.object
};

ChartInputs.defaultProps = {
  queryChartConfigurationFields: {},
  queryResult: {}
};

export default ChartInputs;
