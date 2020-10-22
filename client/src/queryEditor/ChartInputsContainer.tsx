import React from 'react';
import { handleChartConfigurationFieldsChange } from '../stores/editor-actions';
import {
  useQueryResult,
  useChartType,
  useChartFields,
} from '../stores/editor-store';
import ChartInputs from './ChartInputs';

function ChartInputsContainer() {
  const queryResult = useQueryResult();
  const chartType = useChartType();
  const chartFields = useChartFields();

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
