import React from 'react';
import { handleChartConfigurationFieldsChange } from '../stores/queries-actions';
import { useQueriesStore } from '../stores/queries-store';
import ChartInputs from './ChartInputs';

function ChartInputsContainer() {
  const queryResult = useQueriesStore((s) => s.queryResult);
  const chartType = useQueriesStore((s) => s?.query?.chart?.chartType);
  const fields = useQueriesStore((s) => s?.query?.chart?.fields);

  return (
    <ChartInputs
      chartType={chartType}
      queryChartConfigurationFields={fields}
      onChartConfigurationFieldsChange={handleChartConfigurationFieldsChange}
      queryResult={queryResult}
    />
  );
}

export default React.memo(ChartInputsContainer);
