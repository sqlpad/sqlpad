import React from 'react';
import QueryResultDataTable from './QueryResultDataTable';
import QueryResultError from './QueryResultError';
import QueryResultRunning from './QueryResultRunning';

function QueryResultContainer({ isRunning, queryError, queryResult }) {
  if (isRunning) {
    return <QueryResultRunning />;
  } else if (queryError) {
    return <QueryResultError queryError={queryError} />;
  } else {
    return <QueryResultDataTable queryResult={queryResult} />;
  }
}

export default QueryResultContainer;
