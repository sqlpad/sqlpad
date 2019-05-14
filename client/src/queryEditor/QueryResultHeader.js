import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'unistore/react';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer.js';
import Text from '../common/Text';
import { actions } from '../stores/unistoreStore';

const barStyle = {
  height: '30px',
  borderBottom: '1px solid #ccc',
  backgroundColor: '#f4f4f4',
  lineHeight: '30px',
  paddingLeft: 4
};

const headerItemStyle = {
  paddingLeft: 4,
  paddingRight: 48
};

function QueryResultHeader({
  cacheKey,
  config,
  isRunning,
  queryResult,
  runQueryStartTime
}) {
  if (isRunning || !queryResult) {
    return (
      <div style={barStyle}>
        {isRunning ? (
          <span style={headerItemStyle}>
            <Text type="secondary">Query time: </Text>
            <SecondsTimer startTime={runQueryStartTime} /> sec.
          </span>
        ) : null}
      </div>
    );
  }

  const serverSec = queryResult
    ? queryResult.queryRunTime / 1000 + ' sec.'
    : '';
  const rowCount =
    queryResult && queryResult.rows ? queryResult.rows.length : '';

  const incomplete = queryResult ? queryResult.incomplete : false;

  const csvDownloadLink = `/download-results/${cacheKey}.csv`;
  const xlsxDownloadLink = `/download-results/${cacheKey}.xlsx`;

  return (
    <div style={barStyle}>
      <span style={headerItemStyle}>
        <Text type="secondary">Query time: </Text>
        {serverSec}
      </span>
      <span style={headerItemStyle}>
        <Text type="secondary">Rows: </Text>
        {rowCount}
      </span>
      <span style={headerItemStyle}>
        {config.allowCsvDownload && (
          <span>
            <Text type="secondary">Download: </Text>
            <Link
              style={{ marginLeft: 16 }}
              target="_blank"
              rel="noopener noreferrer"
              to={csvDownloadLink}
            >
              .csv
            </Link>
            <Link
              style={{ marginLeft: 16 }}
              target="_blank"
              rel="noopener noreferrer"
              to={xlsxDownloadLink}
            >
              .xlsx
            </Link>
          </span>
        )}
      </span>

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

export default connect(
  ['cacheKey', 'config', 'isRunning', 'queryResult', 'runQueryStartTime'],
  actions
)(React.memo(QueryResultHeader));
