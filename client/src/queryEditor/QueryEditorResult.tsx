import React, { FunctionComponent } from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import {
  useLastStatementId,
  useSessionIsRunning,
  useSessionQueryError,
} from '../stores/editor-store';

const QueryEditorResult: FunctionComponent = () => {
  const isRunning = useSessionIsRunning();
  const queryError = useSessionQueryError();
  const statementId = useLastStatementId();

  return (
    <QueryResultContainer
      isRunning={isRunning}
      queryError={queryError}
      statementId={statementId}
    />
  );
};

export default QueryEditorResult;
