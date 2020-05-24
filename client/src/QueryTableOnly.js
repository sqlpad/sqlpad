import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import ExportButton from './common/ExportButton.js';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultContainer from './common/QueryResultContainer.js';
import SuppressedSetNotification from './common/SuppressedSetNotification';
import useQueryResultById from './utilities/useQueryResultById';
import QueryResultRunning from './common/QueryResultRunning';

function QueryTableOnly({ queryId }) {
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

  const { name, links, incomplete, suppressedResultSet } = queryResult;

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
          {suppressedResultSet && <SuppressedSetNotification />}
          {incomplete && <IncompleteDataNotification />}
          <ExportButton links={links} />
        </div>
      </div>
      <div style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            border: '1px solid #CCC',
          }}
        >
          <QueryResultContainer
            isRunning={isRunning}
            queryResult={queryResult}
            queryError={queryError}
          />
        </div>
      </div>
    </div>
  );
}

QueryTableOnly.propTypes = {
  queryId: PropTypes.string.isRequired,
};

export default QueryTableOnly;
