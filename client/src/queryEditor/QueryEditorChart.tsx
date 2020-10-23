import React, { FunctionComponent, useMemo } from 'react';
import SqlpadTauChart from '../common/SqlpadTauChart';
import {
  useSessionChartFields,
  useSessionChartType,
  useSessionIsRunning,
  useSessionQueryId,
  useSessionQueryResult,
} from '../stores/editor-store';

const ConnectedChart: FunctionComponent = (props) => {
  const queryId = useSessionQueryId() || 'new';
  const isRunning = useSessionIsRunning();
  const queryResult = useSessionQueryResult();
  const chartType = useSessionChartType();
  const chartFields = useSessionChartFields();

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
