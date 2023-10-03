import React, { ChangeEvent } from 'react';
import Select from '../common/Select';
import { handleChartTypeChange } from '../stores/editor-actions';
import { useSessionChartType } from '../stores/editor-store';
import chartDefinitions from '../utilities/chartDefinitions';

function ChartTypeSelect() {
  const chartType = useSessionChartType();

  return (
    <>
      <label>Visualization</label>
      <Select
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          handleChartTypeChange(event.target.value)
        }
        value={chartType}
      >
        <option value="">No visualization</option>
        {chartDefinitions.map((d) => {
          return (
            <option key={d.chartType} value={d.chartType}>
              {d.chartLabel}
            </option>
          );
        })}
      </Select>
    </>
  );
}

export default React.memo(ChartTypeSelect);
