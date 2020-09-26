import React, { FunctionComponent } from 'react';
import SqlpadTauChart from '../common/SqlpadTauChart';
import { useQueriesStore } from '../stores/queries-store';

const ConnectedChart: FunctionComponent = (props) => {
  const queryId = useQueriesStore((s) => s?.query?.id || 'new');
  const isRunning = useQueriesStore((s) => s.isRunning);
  const queryResult = useQueriesStore((s) => s.queryResult);
  const chartConfiguration = useQueriesStore((s) => s?.query?.chart);

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
