import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'unistore/react';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SuppressedSetNotification from '../common/SuppressedSetNotification';
import SecondsTimer from '../common/SecondsTimer.js';
import styles from './QueryResultHeader.module.css';

function QueryResultHeader({
  cacheKey,
  config,
  isRunning,
  queryId,
  queryResult,
  runQueryStartTime
}) {
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

  const serverSec = queryResult ? queryResult.queryRunTime / 1000 : '';
  const rowCount =
    queryResult && queryResult.rows ? queryResult.rows.length : '';

  const incomplete = queryResult ? queryResult.incomplete : false;
  const suppressedSet = queryResult ? queryResult.suppressedResultSet : false;

  const csvDownloadLink = `/download-results/${cacheKey}.csv`;
  const xlsxDownloadLink = `/download-results/${cacheKey}.xlsx`;
  const jsonDownloadLink = `/download-results/${cacheKey}.json`;
  const tableLink = `/query-table/${queryId}`;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarItem}>{serverSec} seconds</div>
      <div className={styles.toolbarItem}>{rowCount} rows</div>

      <div className={styles.toolbarItem}>
        {config.allowCsvDownload && (
          <span className={styles.iconLinkWrapper}>
            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={csvDownloadLink}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .csv
            </Link>

            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={xlsxDownloadLink}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .xlsx
            </Link>

            <Link
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
              to={jsonDownloadLink}
            >
              <DownloadIcon style={{ marginRight: 4 }} size={16} />
              .json
            </Link>
          </span>
        )}
      </div>
      <div className={styles.toolbarItem}>
        <span className={styles.iconLinkWrapper}>
          <Link
            className={styles.iconLink}
            target="_blank"
            rel="noopener noreferrer"
            to={tableLink}
            disabled={!Boolean(queryId) || queryId === 'new'}
          >
            table <OpenInNewIcon style={{ marginLeft: 4 }} size={16} />
          </Link>
        </span>
      </div>

      {suppressedSet && <SuppressedSetNotification />}
      {incomplete && <IncompleteDataNotification />}
    </div>
  );
}

QueryResultHeader.propTypes = {
  cacheKey: PropTypes.string,
  config: PropTypes.object,
  isRunning: PropTypes.bool,
  queryResult: PropTypes.object,
  runQueryStartTime: PropTypes.instanceOf(Date)
};

QueryResultHeader.defaultProps = {
  cacheKey: '',
  config: {},
  isRunning: false
};

function mapStateToProps(state) {
  const { cacheKey, config, isRunning, queryResult, runQueryStartTime } = state;
  return {
    cacheKey,
    config,
    isRunning,
    queryId: state.query && state.query.id,
    queryResult,
    runQueryStartTime
  };
}

export default connect(mapStateToProps)(React.memo(QueryResultHeader));
