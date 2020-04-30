import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ExportButton from './common/ExportButton.js';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import SuppressedSetNotification from './common/SuppressedSetNotification';
import SqlpadTauChart from './common/SqlpadTauChart.js';
import { exportPng } from './common/tauChartRef';
import fetchJson from './utilities/fetch-json.js';

function QueryChartOnly({ queryId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [query, setQuery] = useState(null);
  const [queryError, setQueryError] = useState(null);

  const runQuery = async (queryId) => {
    setIsRunning(true);

    const queryJson = await fetchJson('GET', '/api/queries/' + queryId);
    if (queryJson.error) {
      setIsRunning(false);
      setQueryError(queryJson.error);
      return;
    }
    setQuery(queryJson.data);

    const resultJson = await fetchJson('GET', '/api/query-result/' + queryId);
    setIsRunning(false);
    setQueryError(resultJson.error);
    setQueryResult(resultJson.data);
  };

  useEffect(() => {
    document.title = 'SQLPad';
    runQuery(queryId);
  }, [queryId]);

  const onSaveImageClick = () => {
    exportPng(queryId, query && query.name);
  };

  const suppressedSet = queryResult ? queryResult.suppressedResultSet : false;
  const incomplete = queryResult ? queryResult.incomplete : false;
  const cacheKey = queryResult ? queryResult.cacheKey : null;

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
        <span style={{ fontSize: '1.5rem' }}>{query ? query.name : ''}</span>
        <div style={{ float: 'right' }}>
          {suppressedSet && <SuppressedSetNotification />}
          {incomplete && <IncompleteDataNotification />}
          <ExportButton
            cacheKey={cacheKey}
            onSaveImageClick={onSaveImageClick}
          />
        </div>
      </div>
      <div style={{ height: '100%', display: 'flex' }}>
        <SqlpadTauChart
          queryId={queryId}
          queryName={query && query.name}
          chartConfiguration={query && query.chartConfiguration}
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
