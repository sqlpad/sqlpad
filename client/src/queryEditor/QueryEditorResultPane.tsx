import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import {
  useLastStatementId,
  useSessionBatch,
  useSessionSelectedStatementId,
} from '../stores/editor-store';
import QueryResultBatchHeader from './QueryResultBatchHeader';
import QueryResultStatementHeader from './QueryResultStatementHeader';
import StatementsTable from './StatementsTable';

function QueryEditorResultPane() {
  const selectedStatementId = useSessionSelectedStatementId();
  const lastStatementId = useLastStatementId();

  const batch = useSessionBatch();
  console.log(batch);

  const statementId = selectedStatementId;

  let paneContent = null;
  if (statementId) {
    paneContent = (
      <QueryResultContainer
        statementId={selectedStatementId || lastStatementId}
      />
    );
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
          top: 30,
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
