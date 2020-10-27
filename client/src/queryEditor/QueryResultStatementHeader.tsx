import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import ExportButton from '../common/ExportButton';
import HSpacer from '../common/HSpacer';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import Tooltip from '../common/Tooltip';
import {
  useLastStatementId,
  useSessionConnectionClientId,
  useSessionIsRunning,
  useSessionQueryId,
  useSessionRunQueryStartTime,
  useStatementDurationMs,
  useStatementIncomplete,
  useStatementRowCount,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';

function QueryResultStatementHeader() {
  const isRunning = useSessionIsRunning();
  const queryId = useSessionQueryId();
  const runQueryStartTime = useSessionRunQueryStartTime();
  const lastStatementId = useLastStatementId();

  const rowCount = useStatementRowCount(lastStatementId);
  const hasRows = rowCount !== undefined && rowCount > 0;
  const incomplete = useStatementIncomplete(lastStatementId);
  const durationMs = useStatementDurationMs(lastStatementId);
  const connectionClientId = useSessionConnectionClientId();

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

  const links = {
    csv: `/statement-results/${lastStatementId}.csv`,
    json: `/statement-results/${lastStatementId}.json`,
    xlsx: `/statement-results/${lastStatementId}.xlsx`,
    table: '',
    chart: '',
  };

  if (queryId) {
    links.table = `/query-table/${queryId}`;
    links.chart = `/query-chart/${queryId}`;
    if (connectionClientId) {
      const params = `?connectionClientId=${connectionClientId}`;
      links.table += params;
      links.chart += params;
    }
  }

  const serverSec = durationMs !== undefined ? durationMs / 1000 : 0;

  const showLink =
    typeof queryId === 'string' && queryId !== 'new' && queryId !== '';

  return (
    <div className={styles.toolbar}>
      <HSpacer size={1} grow />

      {lastStatementId && (
        <>
          <div>{rowCount} rows</div>
          <HSpacer />
        </>
      )}

      {config?.allowCsvDownload && hasRows && (
        <>
          <ExportButton links={links} />
          <HSpacer />
        </>
      )}

      {showLink && links.table && (
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
              to={links.table}
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

      {lastStatementId && <div>{serverSec} seconds</div>}
      <HSpacer size={2} />
    </div>
  );
}

export default React.memo(QueryResultStatementHeader);
