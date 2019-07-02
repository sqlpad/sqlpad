import PropTypes from 'prop-types';
import React from 'react';
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
  marginBottom: 16,
  boxSizing: 'border-box',
  width: `calc(1/2*100% - 8px)`
};

function ChartInputs({
  onChartConfigurationFieldsChange,
  queryChartConfigurationFields,
  queryResult,
  chartType
}) {
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
            <label htmlFor={field.fieldId} style={{ marginLeft: 8 }}>
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

  return (
    <div
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {renderFormGroup(chartDefinition.fields)}
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
