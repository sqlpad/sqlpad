import React from 'react';
import ErrorBlock from './ErrorBlock';
import QueryResultDataTable from './QueryResultDataTable';
import QueryResultRunning from './QueryResultRunning';

function QueryResultContainer({ isRunning, queryError, queryResult }) {
  if (isRunning) {
    return <QueryResultRunning />;
  } else if (queryError) {
    return <ErrorBlock>{queryError}</ErrorBlock>;
  } else {
    return <QueryResultDataTable queryResult={queryResult} />;
  }
}

export default QueryResultContainer;
