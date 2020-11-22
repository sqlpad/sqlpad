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

  // If unexpected value return false
  return false;
}

const inputStyle: CSSProperties = {
  marginBottom: 16,
  width: '100%',
};

function ChartInputs() {
  const chartType = useSessionChartType();
  const chartFields = useSessionChartFields();
  const lastStatementId = useLastStatementId();
  const columns = useStatementColumns(lastStatementId);

  const changeChartConfigurationField = (
    chartFieldId: string,
    queryResultField: string | boolean | number
  ) => {
    handleChartConfigurationFieldsChange(chartFieldId, queryResultField);
  };

  const columnNames = (columns || []).map((c) => c.name);

  const chartDefinition = chartDefinitions.find(
    (def) => def.chartType === chartType
  );

  if (!chartDefinition || !chartDefinition.fields) {
    return null;
  }

  const content = chartDefinition.fields.map((field) => {
    if (field.inputType === 'field-dropdown') {
      const optionNodes = columnNames.map((qrfield) => {
        return (
          <option key={qrfield} value={qrfield}>
            {qrfield}
          </option>
        );
      });
      const selectedQueryResultField = chartFields[field.fieldId];
      if (
        selectedQueryResultField &&
        columnNames.indexOf(selectedQueryResultField) === -1
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
      const checked = cleanBoolean(chartFields[field.fieldId]);
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
      const value = chartFields[field.fieldId] || '';
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
