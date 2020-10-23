import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import {
  useSessionIsRunning,
  useSessionQueryId,
  useSessionQueryResult,
  useSessionRunQueryStartTime,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';

function QueryResultHeader() {
  const isRunning = useSessionIsRunning();
  const queryId = useSessionQueryId();
  const queryResult = useSessionQueryResult();
  const runQueryStartTime = useSessionRunQueryStartTime();

  const { config } = useAppContext();
  if (isRunning || !queryResult) {
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

  const rows = queryResult.rows || [];
  const links = queryResult.links || {};
  const serverSec = queryResult.durationMs / 1000;
  const rowCount = rows.length;
  const incomplete = Boolean(queryResult.incomplete);
  const hasRows = rows.length > 0;

  const showLink =
    typeof queryId === 'string' && queryId !== 'new' && queryId !== '';

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarItem}>{serverSec} seconds</div>
      <div className={styles.toolbarItem}>{rowCount} rows</div>

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
      {/* TODO: links.table will not appear if query is saved after run */}
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
