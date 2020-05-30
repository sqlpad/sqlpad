import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import ExportButton from './common/ExportButton.js';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultRunning from './common/QueryResultRunning';
import SqlpadTauChart from './common/SqlpadTauChart.js';
import { exportPng } from './common/tauChartRef';
import useQueryResultById from './utilities/useQueryResultById';

function QueryChartOnly({ queryId }) {
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
          queryName={name}
          chartConfiguration={chart}
          queryResult={queryResult}
          queryError={queryError}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}

QueryChartOnly.propTypes = {
  queryId: PropTypes.string.isRequired,
};

export default QueryChartOnly;
