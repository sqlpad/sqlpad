import React, { useEffect } from 'react';
import ExportButton from './common/ExportButton';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultContainer from './common/QueryResultContainer';
import QueryResultRunning from './common/QueryResultRunning';
import {
  useLastStatementId,
  useSessionQueryError,
  useSessionQueryName,
  useStatementIncomplete,
  useStatementRowCount,
} from './stores/editor-store';
import useQueryResultById from './utilities/useQueryResultById';

type Props = {
  queryId: string;
};

function QueryTableOnly({ queryId }: Props) {
  const [isRunning] = useQueryResultById(queryId);
  const statementId = useLastStatementId();
  const queryError = useSessionQueryError();
  const rowCount = useStatementRowCount(statementId);
  const name = useSessionQueryName();
  const incomplete = useStatementIncomplete(statementId);

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

  const links = {
    csv: `/statement-results/${statementId}.csv`,
    json: `/statement-results/${statementId}.json`,
    xlsx: `/statement-results/${statementId}.xlsx`,
    table: '',
    chart: '',
  };

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
        <span style={{ fontSize: '1.5rem' }}>{name || ''}</span>
        <div style={{ float: 'right' }}>
          {incomplete && <IncompleteDataNotification />}
          <ExportButton links={links} />
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
          <QueryResultContainer
            isRunning={isRunning}
            statementId={statementId}
            queryError={queryError}
          />
        </div>
      </div>
    </div>
  );
}

export default QueryTableOnly;
