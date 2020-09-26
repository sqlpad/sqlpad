import React, { FunctionComponent } from 'react';
import QueryResultDataTable from '../common/QueryResultContainer';
import { useQueriesStore } from '../stores/queries-store';

const ConnectedQueryEditorResult: FunctionComponent = (props) => {
  const isRunning = useQueriesStore((s) => s.isRunning);
  const queryResult = useQueriesStore((s) => s.queryResult);
  const queryError = useQueriesStore((s) => s.queryError);

  return (
    <QueryResultDataTable
      {...props}
      isRunning={isRunning}
      queryResult={queryResult}
      queryError={queryError}
    />
  );
};

export default ConnectedQueryEditorResult;
