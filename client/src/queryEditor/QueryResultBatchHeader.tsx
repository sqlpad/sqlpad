import React from 'react';
import HSpacer from '../common/HSpacer';
import SecondsTimer from '../common/SecondsTimer';
import {
  useLastStatementId,
  useSessionIsRunning,
  useSessionRunQueryStartTime,
  useStatementDurationMs,
} from '../stores/editor-store';
import styles from './QueryResultHeader.module.css';

function QueryResultBatchHeader() {
  const isRunning = useSessionIsRunning();
  const runQueryStartTime = useSessionRunQueryStartTime();
  const lastStatementId = useLastStatementId();
  const durationMs = useStatementDurationMs(lastStatementId);

  let timerContent = null;
  if (isRunning) {
    timerContent = (
      <div>
        <SecondsTimer startTime={runQueryStartTime} /> seconds
      </div>
    );
  } else if (lastStatementId && durationMs !== undefined) {
    const serverSec = durationMs / 1000;
    timerContent = <div>{serverSec} seconds</div>;
  }

  return (
    <div className={styles.toolbar}>
      <HSpacer grow />
      {timerContent}
      <HSpacer size={2} />
    </div>
  );
}

export default React.memo(QueryResultBatchHeader);
