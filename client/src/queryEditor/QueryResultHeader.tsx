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
  useStatementStatus,
  useStatementText,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';

function QueryResultHeader() {
  const isRunning = useSessionIsRunning();
  const runQueryStartTime = useSessionRunQueryStartTime();
  const statementId = useSessionSelectedStatementId();

  const rowCount = useStatementRowCount(statementId);
  const hasRows = rowCount !== undefined && rowCount > 0;
  const incomplete = useStatementIncomplete(statementId);
  const statementDurationMs = useStatementDurationMs(statementId);
  const status = useStatementStatus(statementId);

  const batch = useSessionBatch();
  const numOfStatements = batch?.statements.length || 0;

  const statementText = useStatementText(statementId);
  const statementSequence = useStatementSequence(statementId);

  const { config } = useAppContext();

  const tableLink = useSessionTableLink(statementSequence);
  const showLink = Boolean(tableLink);

  const isStatementFinished = status === 'finished';
  const isStatementRunning = status === 'queued' || status === 'started';

  let timerContent = null;
  if ((statementId && isStatementRunning) || (!statementId && isRunning)) {
    timerContent = (
      <div style={{ whiteSpace: 'nowrap' }}>
        <SecondsTimer startTime={runQueryStartTime} /> seconds
      </div>
    );
  } else if (statementId && isStatementFinished) {
    const serverSec =
      statementDurationMs !== undefined ? statementDurationMs / 1000 : 0;
    timerContent = (
      <div style={{ whiteSpace: 'nowrap' }}>{serverSec} seconds</div>
    );
  } else if (!statementId && batch?.durationMs !== undefined) {
    const serverSec = batch?.durationMs / 1000;
    timerContent = <div>{serverSec} seconds</div>;
  }

  return (
    <div className={styles.toolbar}>
      {statementId && numOfStatements > 1 ? (
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

      {statementId && statementSequence && numOfStatements > 1 && (
        <>
          <div className={styles.statementHeaderStatementText}>
            {`${statementSequence}. ${statementText}`}
          </div>
          <HSpacer size={1} grow />
        </>
      )}

      {statementId && isStatementFinished && (
        <>
          <div style={{ whiteSpace: 'nowrap' }}>{rowCount} rows</div>
          <HSpacer />
        </>
      )}

      {statementId && isStatementFinished && showLink && (
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

      {statementId &&
        isStatementFinished &&
        config?.allowCsvDownload &&
        hasRows && (
          <>
            <ExportButton statementId={statementId} />
            <HSpacer />
          </>
        )}

      {statementId && isStatementFinished && incomplete && (
        <>
          <IncompleteDataNotification />
          <HSpacer />
        </>
      )}

      {timerContent}
      <HSpacer size={1} />
    </div>
  );
}

export default React.memo(QueryResultHeader);
