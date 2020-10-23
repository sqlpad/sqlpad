import React from 'react';
import { handleChartConfigurationFieldsChange } from '../stores/editor-actions';
import {
  useSessionQueryResult,
  useSessionChartType,
  useSessionChartFields,
} from '../stores/editor-store';
import ChartInputs from './ChartInputs';

function ChartInputsContainer() {
  const queryResult = useSessionQueryResult();
  const chartType = useSessionChartType();
  const chartFields = useSessionChartFields();

  return (
    <ChartInputs
      chartType={chartType}
      queryChartConfigurationFields={chartFields}
      onChartConfigurationFieldsChange={handleChartConfigurationFieldsChange}
      queryResult={queryResult}
    />
  );
}

export default React.memo(ChartInputsContainer);
