import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import {
  useLastStatementId,
  useSessionIsRunning,
  useSessionQueryId,
  useSessionRunQueryStartTime,
  useStatementIncomplete,
  useStatementRowCount,
  useStatementDurationMs,
  useSessionConnectionClientId,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';

function QueryResultHeader() {
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
        {isRunning ? (
          <span className={styles.toolbarItem}>
            Query time: <SecondsTimer startTime={runQueryStartTime} />
          </span>
        ) : null}
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
      {lastStatementId && (
        <div className={styles.toolbarItem}>{serverSec} seconds</div>
      )}
      {lastStatementId && (
        <div className={styles.toolbarItem}>{rowCount} rows</div>
      )}

      <div className={styles.toolbarItem}>
        {config?.allowCsvDownload && hasRows && (
          <span className={styles.iconLinkWrapper}>
            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={links.csv}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .csv
            </Link>

            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={links.xlsx}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .xlsx
            </Link>

            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={links.json}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .json
            </Link>
          </span>
        )}
      </div>
      {showLink && links.table && (
        <div className={styles.toolbarItem}>
          <span className={styles.iconLinkWrapper}>
            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={links.table}
            >
              table <OpenInNewIcon style={{ marginLeft: 4 }} size={16} />
            </Link>
          </span>
        </div>
      )}
      {incomplete && <IncompleteDataNotification />}
    </div>
  );
}

export default React.memo(QueryResultHeader);
