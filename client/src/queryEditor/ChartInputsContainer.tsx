import React from 'react';
import { handleChartConfigurationFieldsChange } from '../stores/editor-actions';
import { useEditorStore } from '../stores/editor-store';
import ChartInputs from './ChartInputs';

function ChartInputsContainer() {
  const queryResult = useEditorStore((s) => s.queryResult);
  const chartType = useEditorStore((s) => s?.query?.chart?.chartType);
  const fields = useEditorStore((s) => s?.query?.chart?.fields);

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
