import queryString from 'query-string';
import React, { useEffect } from 'react';
import ExportButton from '../common/ExportButton';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import QueryResultContainer from '../common/QueryResultContainer';
import QueryResultRunning from '../common/QueryResultRunning';
import { loadQuery, runQuery } from '../stores/editor-actions';
import {
  useSessionIsRunning,
  useSessionQueryName,
  useSessionStatementIdBySequence,
  useStatementIncomplete,
  useStatementRowCount,
} from '../stores/editor-store';

type Props = {
  queryId: string;
};

interface ParsedQueryString {
  sequence?: string;
  connectionClientId?: string;
}

function QueryTableOnly({ queryId }: Props) {
  const qs: ParsedQueryString = queryString.parse(window.location.search);
  const sequence = qs.sequence ? parseInt(qs.sequence) : undefined;

  const statementId = useSessionStatementIdBySequence(sequence);

  const isRunning = useSessionIsRunning();
  const rowCount = useStatementRowCount(statementId);
  const name = useSessionQueryName();
  const incomplete = useStatementIncomplete(statementId);

  useEffect(() => {
    loadQuery(queryId).then(() => runQuery());
  }, [queryId]);

  useEffect(() => {
    document.title = 'SQLPad';
  }, []);

  if (isRunning || rowCount === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          flexDirection: 'column',
        }}
      >
        <QueryResultRunning />
      </div>
    );
  }

  let title = name || '';
  if (sequence) {
    title += ` (statement #${sequence})`;
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        flexDirection: 'column',
        padding: '16px',
      }}
    >
      <div style={{ height: '50px' }}>
        <span style={{ fontSize: '1.5rem' }}>{title}</span>
        <div style={{ float: 'right' }}>
          {incomplete && <IncompleteDataNotification />}
          <ExportButton statementId={statementId} />
        </div>
      </div>
      <div style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            border: '1px solid #CCC',
          }}
        >
          <QueryResultContainer statementId={statementId} />
        </div>
      </div>
    </div>
  );
}

export default QueryTableOnly;
