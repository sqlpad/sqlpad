import React, { ChangeEvent, CSSProperties } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import { handleChartConfigurationFieldsChange } from '../stores/editor-actions';
import {
  useLastStatementId,
  useSessionChartFields,
  useSessionChartType,
  useStatementColumns,
} from '../stores/editor-store';
import chartDefinitions from '../utilities/chartDefinitions';

function cleanBoolean(value: string | boolean) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  // This shouldn't happen, but if it does return false
  console.warn('Unexpected value ', value);
  return false;
}

const inputStyle: CSSProperties = {
  marginBottom: 16,
  width: '100%',
};

function ChartInputs() {
  const chartType = useSessionChartType();
  const queryChartConfigurationFields = useSessionChartFields();
  const lastStatementId = useLastStatementId();
  const columns = useStatementColumns(lastStatementId);

  const changeChartConfigurationField = (
    chartFieldId: string,
    queryResultField: string | boolean | number
  ) => {
    handleChartConfigurationFieldsChange(chartFieldId, queryResultField);
  };

  let resultColumnNames: string[] = [];
  if (columns) {
    resultColumnNames = columns.map((c) => c.name);
  }

  const chartDefinition = chartDefinitions.find(
    (def) => def.chartType === chartType
  );

  if (!chartDefinition || !chartDefinition.fields) {
    return null;
  }

  const content = chartDefinition.fields.map((field) => {
    if (field.inputType === 'field-dropdown') {
      const optionNodes = resultColumnNames.map((qrfield) => {
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
        resultColumnNames.indexOf(selectedQueryResultField) === -1
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
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
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
            onChange={(e) =>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
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

  return (
    <div
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {content}
    </div>
  );
}

export default ChartInputs;
