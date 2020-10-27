import React from 'react';
import QueryResultContainer from '../common/QueryResultContainer';
import { useLastStatementId } from '../stores/editor-store';
import QueryResultHeader from './QueryResultHeader';

function QueryEditorResultPane() {
  const statementId = useLastStatementId();

  return (
    <div>
      <QueryResultHeader />
      <div
        style={{
          position: 'absolute',
          top: 30,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <QueryResultContainer statementId={statementId} />
      </div>
    </div>
  );
}

export default React.memo(QueryEditorResultPane);
