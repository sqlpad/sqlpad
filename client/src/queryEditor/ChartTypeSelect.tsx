import React from 'react';
import Select from '../common/Select';
import { handleChartTypeChange } from '../stores/queries-actions';
import { useQueriesStore } from '../stores/queries-store';
import chartDefinitions from '../utilities/chartDefinitions';

function ChartTypeSelect({ className, style }: any) {
  const chartType = useQueriesStore((s) => s?.query?.chart?.chartType);

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
