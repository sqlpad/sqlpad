import React, { useEffect } from 'react';
import ExportButton from './common/ExportButton';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultRunning from './common/QueryResultRunning';
import SqlpadTauChart from './common/SqlpadTauChart';
import { exportPng } from './common/tauChartRef';
import useQueryResultById from './utilities/useQueryResultById';

type Props = {
  queryId: string;
};

function QueryChartOnly({ queryId }: Props) {
  const [queryError, queryResult, isRunning] = useQueryResultById(queryId);

  useEffect(() => {
    document.title = 'SQLPad';
  }, []);

  if (isRunning || !queryResult) {
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

  const { name, chart, links, incomplete } = queryResult;

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
          <ExportButton links={links} onSaveImageClick={onSaveImageClick} />
        </div>
      </div>
      <div style={{ height: '100%', display: 'flex' }}>
        <SqlpadTauChart
          queryId={queryId}
          chartConfiguration={chart}
          queryResult={queryResult}
          queryError={queryError}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}

export default QueryChartOnly;
