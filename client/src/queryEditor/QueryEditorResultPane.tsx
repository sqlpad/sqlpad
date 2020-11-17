import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import QueryResultRunning from '../common/QueryResultRunning';
import {
  useSessionBatch,
  useSessionIsRunning,
  useSessionSelectedStatementId,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';
import QueryResultBatchHeader from './QueryResultBatchHeader';
import QueryResultStatementHeader from './QueryResultStatementHeader';
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
  // If running for a single statement, or multiple with a statement selected, show running animation until query results are loaded.
  // If isRunning and selected statement, user ran a single query or ran multiple but selected a particular query to view
  // If a statement is selected, and it is finished but no data yet, we're still loading the data
  if (
    (isRunning && selectedStatementId) ||
    (selectedStatementId && status === 'finished' && !data)
  ) {
    paneContent = <QueryResultRunning />;
  } else if (selectedStatementId) {
    paneContent = <QueryResultContainer statementId={selectedStatementId} />;
  } else if (batch?.statements) {
    paneContent = <StatementsTable statements={batch?.statements || []} />;
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
