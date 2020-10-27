import React, { useEffect, useMemo } from 'react';
import ExportButton from './common/ExportButton';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultRunning from './common/QueryResultRunning';
import SqlpadTauChart from './common/SqlpadTauChart';
import { exportPng } from './common/tauChartRef';
import useQueryResultById from './utilities/useQueryResultById';
import {
  useLastStatementId,
  useSessionChartFields,
  useSessionChartType,
  useSessionQueryError,
  useSessionQueryName,
  useStatementColumns,
  useStatementIncomplete,
  useStatementRowCount,
} from './stores/editor-store';
import { api } from './utilities/api';

type Props = {
  queryId: string;
};

function QueryChartOnly({ queryId }: Props) {
  const [isRunning] = useQueryResultById(queryId);
  const statementId = useLastStatementId();
  const queryError = useSessionQueryError();
  const rowCount = useStatementRowCount(statementId);
  const name = useSessionQueryName();
  const incomplete = useStatementIncomplete(statementId);
  const chartFields = useSessionChartFields();
  const chartType = useSessionChartType();
  const columns = useStatementColumns(statementId);
  const { data: rows } = api.useStatementResults(statementId);

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

  const links = {
    csv: `/statement-results/${statementId}.csv`,
    json: `/statement-results/${statementId}.json`,
    xlsx: `/statement-results/${statementId}.xlsx`,
    table: '',
    chart: '',
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
          <ExportButton links={links} onSaveImageClick={onSaveImageClick} />
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
