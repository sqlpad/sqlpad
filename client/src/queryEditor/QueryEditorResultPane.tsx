import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import {
  useLastStatementId,
  useSessionBatch,
  useSessionSelectedStatementId,
} from '../stores/editor-store';
import QueryResultStatementHeader from './QueryResultStatementHeader';
import QueryResultBatchHeader from './QueryResultBatchHeader';

function QueryEditorResultPane() {
  const selectedStatementId = useSessionSelectedStatementId();
  const lastStatementId = useLastStatementId();

  const batch = useSessionBatch();
  console.log(batch);

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
        <QueryResultContainer
          statementId={selectedStatementId || lastStatementId}
        />
      </div>
    </div>
  );
}

export default React.memo(QueryEditorResultPane);
