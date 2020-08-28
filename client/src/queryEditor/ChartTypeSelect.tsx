import React from 'react';
import { connect } from 'unistore/react';
import Select from '../common/Select';
import { handleChartTypeChange } from '../stores/queries';
import chartDefinitions from '../utilities/chartDefinitions';

function mapStateToProps(state: any) {
  return {
    chartType: state.query && state.query.chart && state.query.chart.chartType,
  };
}

const ConnectedVisSidebar = connect(mapStateToProps, { handleChartTypeChange })(
  React.memo(ChartTypeSelect)
);

function ChartTypeSelect({
  chartType,
  handleChartTypeChange,
  className,
  style,
}: any) {
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

export default ConnectedVisSidebar;
