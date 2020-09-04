import React from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import chartDefinitions from '../utilities/chartDefinitions';

function cleanBoolean(value: any) {
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
  width: `calc(1/2*100% - 8px)`,
};

type OwnProps = {
  chartType?: string;
  onChartConfigurationFieldsChange: (...args: any[]) => any;
  queryChartConfigurationFields?: any;
  queryResult?: any;
};

type Props = OwnProps & typeof ChartInputs.defaultProps;

function ChartInputs({
  onChartConfigurationFieldsChange,
  queryChartConfigurationFields,
  queryResult,
  chartType,
}: Props) {
  const changeChartConfigurationField = (
    chartFieldId: any,
    queryResultField: any
  ) => {
    onChartConfigurationFieldsChange(chartFieldId, queryResultField);
  };

  const renderFormGroup = (inputDefinitionFields: any) => {
    let resultColumnNames: any = [];
    if (queryResult && queryResult.columns) {
      resultColumnNames = queryResult.columns.map((c: any) => c.name);
    }

    return inputDefinitionFields.map((field: any) => {
      if (field.inputType === 'field-dropdown') {
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'qrfield' implicitly has an 'any' type.
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
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type '"border-b... Remove this comment to see the full error message
          <div style={inputStyle} key={field.fieldId}>
            <label>{field.label}</label>
            <Select
              className="w-100"
              value={selectedQueryResultField}
              onChange={(event: any) =>
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
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ marginBottom: number; boxSizing: string; w... Remove this comment to see the full error message
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
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ marginBottom: number; boxSizing: string; w... Remove this comment to see the full error message
          <div style={inputStyle} key={field.fieldId}>
            <label>{field.label}</label>
            <Input
              value={value}
              onChange={(e: any) =>
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
    (def) => def.chartType === chartType
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
        justifyContent: 'space-between',
      }}
    >
      {renderFormGroup(chartDefinition.fields)}
    </div>
  );
}

ChartInputs.defaultProps = {
  queryChartConfigurationFields: {},
  queryResult: {},
};

export default ChartInputs;
