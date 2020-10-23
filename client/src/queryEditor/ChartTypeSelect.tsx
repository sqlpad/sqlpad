import React from 'react';
import Select from '../common/Select';
import { handleChartTypeChange } from '../stores/editor-actions';
import { useSessionChartType } from '../stores/editor-store';
import chartDefinitions from '../utilities/chartDefinitions';

function ChartTypeSelect({ className, style }: any) {
  const chartType = useSessionChartType();

  const chartOptions = chartDefinitions.map((d) => {
    return (
      <option key={d.chartType} value={d.chartType}>
        {d.chartLabel}
      </option>
    );
  });

  return (
    <Select
      className={className}
      onChange={(event: any) => handleChartTypeChange(event.target.value)}
      style={style}
      value={chartType}
    >
      <option value="">No visualization</option>
      {chartOptions}
    </Select>
  );
}

export default React.memo(ChartTypeSelect);
