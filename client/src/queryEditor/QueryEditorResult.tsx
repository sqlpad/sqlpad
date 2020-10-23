import React, { FunctionComponent } from 'react';
import QueryResultDataTable from '../common/QueryResultContainer';
import {
  useSessionIsRunning,
  useSessionQueryError,
  useSessionQueryResult,
} from '../stores/editor-store';

const ConnectedQueryEditorResult: FunctionComponent = (props) => {
  const isRunning = useSessionIsRunning();
  const queryResult = useSessionQueryResult();
  const queryError = useSessionQueryError();

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
