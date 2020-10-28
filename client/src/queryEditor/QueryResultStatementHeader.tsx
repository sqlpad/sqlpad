import MenuLeftIcon from 'mdi-react/MenuLeftIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import ExportButton from '../common/ExportButton';
import HSpacer from '../common/HSpacer';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import Tooltip from '../common/Tooltip';
import { selectStatementId } from '../stores/editor-actions';
import {
  useSessionBatch,
  useSessionConnectionClientId,
  useSessionIsRunning,
  useSessionQueryId,
  useSessionRunQueryStartTime,
  useSessionSelectedStatementId,
  useStatementDurationMs,
  useStatementIncomplete,
  useStatementRowCount,
  useStatementSequence,
  useStatementText,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';

function QueryResultStatementHeader() {
  const isRunning = useSessionIsRunning();
  const queryId = useSessionQueryId();
  const runQueryStartTime = useSessionRunQueryStartTime();
  const statementId = useSessionSelectedStatementId();

  const rowCount = useStatementRowCount(statementId);
  const hasRows = rowCount !== undefined && rowCount > 0;
  const incomplete = useStatementIncomplete(statementId);
  const durationMs = useStatementDurationMs(statementId);
  const connectionClientId = useSessionConnectionClientId();

  const batch = useSessionBatch();
  const numOfStatements = batch?.statements.length || 0;

  const statementText = useStatementText(statementId);
  const statementSequence = useStatementSequence(statementId);

  const { config } = useAppContext();

  if (isRunning) {
    return (
      <div className={styles.toolbar}>
        <HSpacer size={1} grow />
        <div>
          <SecondsTimer startTime={runQueryStartTime} /> seconds
        </div>
        <HSpacer size={2} />
      </div>
    );
  }

  let tableLink = '';

  if (queryId) {
    tableLink = `/query-table/${queryId}`;
    if (connectionClientId) {
      tableLink += `?connectionClientId=${connectionClientId}`;
    }
  }

  const serverSec = durationMs !== undefined ? durationMs / 1000 : 0;

  const showLink =
    typeof queryId === 'string' && queryId !== 'new' && queryId !== '';

  return (
    <div className={styles.toolbar}>
      {numOfStatements > 1 ? (
        <Button
          className={styles.returnToStatementsBtn}
          variant="primary-ghost"
          onClick={() => {
            selectStatementId('');
          }}
        >
          <MenuLeftIcon /> Return to statements
        </Button>
      ) : null}

      <HSpacer size={1} grow />
      <div className={styles.statementHeaderStatementText}>
        {statementSequence && numOfStatements > 1
          ? `${statementSequence}. ${statementText}`
          : ''}
      </div>
      <HSpacer size={1} grow />

      {statementId && (
        <>
          <div style={{ whiteSpace: 'nowrap' }}>{rowCount} rows</div>
          <HSpacer />
        </>
      )}

      {config?.allowCsvDownload && hasRows && (
        <>
          <ExportButton statementId={statementId} />
          <HSpacer />
        </>
      )}

      {showLink && tableLink && (
        <>
          <Tooltip label="Open table in new window">
            <Link
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
              target="_blank"
              rel="noopener noreferrer"
              to={tableLink}
            >
              <OpenInNewIcon size={16} />
            </Link>
          </Tooltip>
          <HSpacer />
        </>
      )}

      {incomplete && (
        <>
          <IncompleteDataNotification />
          <HSpacer />
        </>
      )}

      {statementId && (
        <div style={{ whiteSpace: 'nowrap' }}>{serverSec} seconds</div>
      )}
      <HSpacer size={1} />
    </div>
  );
}

export default React.memo(QueryResultStatementHeader);
