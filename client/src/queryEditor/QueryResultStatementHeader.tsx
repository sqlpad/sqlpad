import MenuLeftIcon from 'mdi-react/MenuLeftIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import Button from '../common/Button';
import ExportButton from '../common/ExportButton';
import HSpacer from '../common/HSpacer';
import IconButton from '../common/IconButton';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import { selectStatementId } from '../stores/editor-actions';
import {
  useSessionBatch,
  useSessionIsRunning,
  useSessionRunQueryStartTime,
  useSessionSelectedStatementId,
  useSessionTableLink,
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
  const runQueryStartTime = useSessionRunQueryStartTime();
  const statementId = useSessionSelectedStatementId();

  const rowCount = useStatementRowCount(statementId);
  const hasRows = rowCount !== undefined && rowCount > 0;
  const incomplete = useStatementIncomplete(statementId);
  const durationMs = useStatementDurationMs(statementId);

  const batch = useSessionBatch();
  const numOfStatements = batch?.statements.length || 0;

  const statementText = useStatementText(statementId);
  const statementSequence = useStatementSequence(statementId);

  const { config } = useAppContext();

  const tableLink = useSessionTableLink(statementSequence);
  const showLink = Boolean(tableLink);

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

  const serverSec = durationMs !== undefined ? durationMs / 1000 : 0;

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

      {showLink && tableLink && (
        <>
          <IconButton
            disabled={!Boolean(tableLink)}
            to={tableLink}
            target="_blank"
            rel="noopener noreferrer"
            tooltip="Open table in new window"
          >
            <OpenInNewIcon size={16} />
          </IconButton>
          <HSpacer />
        </>
      )}

      {config?.allowCsvDownload && hasRows && (
        <>
          <ExportButton statementId={statementId} />
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
