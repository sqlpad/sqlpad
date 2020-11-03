import React, { FunctionComponent, useMemo } from 'react';
import SqlpadTauChart from '../common/SqlpadTauChart';
import {
  useLastStatementId,
  useSessionChartFields,
  useSessionChartType,
  useSessionIsRunning,
  useSessionQueryId,
  useStatementColumns,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';

const ConnectedChart: FunctionComponent = (props) => {
  const queryId = useSessionQueryId() || 'new';
  const isRunning = useSessionIsRunning();
  const chartType = useSessionChartType();
  const chartFields = useSessionChartFields();
  const statementId = useLastStatementId();
  const columns = useStatementColumns(statementId);
  const status = useStatementStatus(statementId);
  const { data } = api.useStatementResults(statementId, status);

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
      columns={columns}
      rows={data}
      chartConfiguration={chartConfiguration}
      {...props}
    />
  );
};

export default ConnectedChart;
