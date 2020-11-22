import React, { useEffect, useMemo } from 'react';
import ExportButton from '../common/ExportButton';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import QueryResultRunning from '../common/QueryResultRunning';
import SqlpadTauChart from '../common/SqlpadTauChart';
import { exportPng } from '../common/tauChartRef';
import { loadQuery, runQuery } from '../stores/editor-actions';
import {
  useLastStatementId,
  useSessionChartFields,
  useSessionChartType,
  useSessionIsRunning,
  useSessionQueryError,
  useSessionQueryName,
  useStatementColumns,
  useStatementIncomplete,
  useStatementRowCount,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';

type Props = {
  queryId: string;
};

function QueryChartOnly({ queryId }: Props) {
  const isRunning = useSessionIsRunning();
  const statementId = useLastStatementId();
  const queryError = useSessionQueryError();
  const rowCount = useStatementRowCount(statementId);
  const name = useSessionQueryName();
  const incomplete = useStatementIncomplete(statementId);
  const chartFields = useSessionChartFields();
  const chartType = useSessionChartType();
  const columns = useStatementColumns(statementId);
  const status = useStatementStatus(statementId);
  const { data: rows } = api.useStatementResults(statementId, status);

  useEffect(() => {
    loadQuery(queryId).then(() => runQuery());
  }, [queryId]);

  useEffect(() => {
    document.title = 'SQLPad';
  }, []);

  const chart = useMemo(() => {
    return {
      chartType,
      fields: chartFields,
    };
  }, [chartType, chartFields]);

  if (isRunning || rowCount === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          flexDirection: 'column',
        }}
      >
        <QueryResultRunning />
      </div>
    );
  }

  const onSaveImageClick = () => {
    exportPng(queryId, name || '');
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        flexDirection: 'column',
        padding: '16px',
      }}
    >
      <div style={{ height: '50px' }}>
        <span style={{ fontSize: '1.5rem' }}>{name || ''}</span>
        <div style={{ float: 'right' }}>
          {incomplete && <IncompleteDataNotification />}
          <ExportButton
            statementId={statementId}
            onSaveImageClick={onSaveImageClick}
          />
        </div>
      </div>
      <div style={{ height: '100%', display: 'flex' }}>
        <SqlpadTauChart
          queryId={queryId}
          chartConfiguration={chart}
          columns={columns}
          rows={rows}
          queryError={queryError}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}

export default QueryChartOnly;
