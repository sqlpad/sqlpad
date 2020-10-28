import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import QueryResultRunning from '../common/QueryResultRunning';
import {
  useSessionBatch,
  useSessionIsRunning,
  useSessionSelectedStatementId,
} from '../stores/editor-store';
import QueryResultBatchHeader from './QueryResultBatchHeader';
import QueryResultStatementHeader from './QueryResultStatementHeader';
import StatementsTable from './StatementsTable';

function QueryEditorResultPane() {
  const selectedStatementId = useSessionSelectedStatementId();
  const isRunning = useSessionIsRunning();

  // Batch reference will change frequently during load
  // This component should be cheap to render though so this should be okay
  const batch = useSessionBatch();
  const statementId = selectedStatementId;

  let paneContent = null;
  if (statementId) {
    paneContent = <QueryResultContainer statementId={selectedStatementId} />;
  } else if (batch?.statements) {
    paneContent = <StatementsTable statements={batch?.statements || []} />;
  } else if (isRunning) {
    // If a statementId isn't set yet, and there aren't statements,
    // but a query is running, that means the initial batch creation hasn't happened yet
    // For this case show a spinner, so there isn't an awkward delay
    paneContent = <QueryResultRunning />;
  }

  return (
    <div>
      {selectedStatementId && <QueryResultStatementHeader />}
      {!selectedStatementId && <QueryResultBatchHeader />}
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
