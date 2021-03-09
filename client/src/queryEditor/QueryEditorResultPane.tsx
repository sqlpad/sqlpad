import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import QueryResultRunning from '../common/QueryResultRunning';
import { setMouseOverResultPane } from '../stores/editor-actions';
import {
  useSessionBatch,
  useSessionIsRunning,
  useSessionSelectedStatementId,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';
import QueryResultHeader from './QueryResultHeader';
import StatementsTable from './StatementsTable';

function QueryEditorResultPane() {
  const selectedStatementId = useSessionSelectedStatementId();
  const isRunning = useSessionIsRunning();
  const status = useStatementStatus(selectedStatementId);

  // Batch reference will change frequently during load
  // This component should be cheap to render though so this should be okay
  const batch = useSessionBatch();

  // This API call is also made in QueryResultContainer
  // Calls will be shared. This is here to access loading status
  const { data } = api.useStatementResults(selectedStatementId, status);

  let paneContent = null;
  // In order to prevent jitter on loading/runnig indicator all loading state needs to be figured at this level
  if (
    // User started run and haven't gotten initial batch data back yet
    (isRunning && !batch) ||
    // user ran single query and it is still running
    (isRunning && batch?.statements.length === 1) ||
    // selected statement is still running or queued
    (selectedStatementId && (status === 'queued' || status === 'started')) ||
    // selected statement's data is loading from fetch
    (selectedStatementId && status === 'finished' && !data)
  ) {
    paneContent = <QueryResultRunning />;
  } else if (selectedStatementId) {
    paneContent = <QueryResultContainer statementId={selectedStatementId} />;
  } else if (batch?.statements) {
    paneContent = <StatementsTable statements={batch?.statements || []} />;
  }

  return (
    <div
      onMouseOver={() => setMouseOverResultPane(true)}
      onMouseLeave={() => setMouseOverResultPane(false)}
    >
      <QueryResultHeader />
      <div
        style={{
          position: 'absolute',
          top: 34,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {paneContent}
      </div>
    </div>
  );
}

export default React.memo(QueryEditorResultPane);
