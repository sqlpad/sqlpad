import React, { FunctionComponent } from 'react';
import SqlpadTauChart from '../common/SqlpadTauChart';
import { useEditorStore } from '../stores/editor-store';

const ConnectedChart: FunctionComponent = (props) => {
  const queryId = useEditorStore((s) => s?.query?.id || 'new');
  const isRunning = useEditorStore((s) => s.isRunning);
  const queryResult = useEditorStore((s) => s.queryResult);
  const chartConfiguration = useEditorStore((s) => s?.query?.chart);

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
