import React, { FunctionComponent } from 'react';
import QueryResultDataTable from '../common/QueryResultContainer';
import {
  useIsRunning,
  useQueryError,
  useQueryResult,
} from '../stores/editor-store';

const ConnectedQueryEditorResult: FunctionComponent = (props) => {
  const isRunning = useIsRunning();
  const queryResult = useQueryResult();
  const queryError = useQueryError();

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
