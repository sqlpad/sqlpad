import PropTypes from 'prop-types';
import React from 'react';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer.js';
import styles from './QueryHistoryResultHeader.module.css';

function QueryHistoryResultHeader({
  isRunning,
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

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarItem}>{serverSec} seconds</div>
      <div className={styles.toolbarItem}>{rowCount} rows</div>

      {incomplete && <IncompleteDataNotification />}
    </div>
  );
}

QueryHistoryResultHeader.propTypes = {
  isRunning: PropTypes.bool,
  queryResult: PropTypes.object,
  runQueryStartTime: PropTypes.instanceOf(Date)
};

QueryHistoryResultHeader.defaultProps = {
  isRunning: false
};

export default QueryHistoryResultHeader;
