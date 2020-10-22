import React, { FunctionComponent, useMemo } from 'react';
import SqlpadTauChart from '../common/SqlpadTauChart';
import {
  useChartFields,
  useChartType,
  useIsRunning,
  useQueryId,
  useQueryResult,
} from '../stores/editor-store';

const ConnectedChart: FunctionComponent = (props) => {
  const queryId = useQueryId() || 'new';
  const isRunning = useIsRunning();
  const queryResult = useQueryResult();
  const chartType = useChartType();
  const chartFields = useChartFields();

  const chartConfiguration = useMemo(() => {
    return {
      chartType,
      fields: chartFields,
    };
  }, [chartType, chartFields]);

  return (
    <SqlpadTauChart
      queryId={queryId}
      isRunning={isRunning}
      queryResult={queryResult}
      chartConfiguration={chartConfiguration}
      {...props}
    />
  );
};

export default ConnectedChart;
