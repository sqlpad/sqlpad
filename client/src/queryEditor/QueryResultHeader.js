import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer.js';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';

function QueryResultHeader({
  cacheKey,
  config,
  isRunning,
  queryResult,
  runQueryStartTime
}) {
  if (isRunning || !queryResult) {
    return (
      <div
        className="bb b--moon-gray bg-near-white pa2 nowrap fw6 near-black"
        style={{ height: '30px' }}
      >
        {isRunning ? (
          <span className="pl1 pr5">
            <span className="gray">Query Run Time: </span>
            <span>
              <SecondsTimer startTime={runQueryStartTime} /> sec.
            </span>
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
    <div
      className="bb b--moon-gray bg-near-white pa2 nowrap fw6 near-black"
      style={{ height: '30px' }}
    >
      <span className="pl1 pr5">
        <span className="gray">Query Run Time: </span>
        {serverSec}
      </span>
      <span className="pr5">
        <span className="gray">Rows: </span>
        {rowCount}
      </span>
      <span className="pr5">
        {config.allowCsvDownload && (
          <span>
            <span className="gray">Download: </span>
            <Link
              className="ml3"
              target="_blank"
              rel="noopener noreferrer"
              to={csvDownloadLink}
            >
              .csv
            </Link>
            <Link
              className="ml3"
              target="_blank"
              rel="noopener noreferrer"
              to={xlsxDownloadLink}
            >
              .xlsx
            </Link>
          </span>
        )}
      </span>
      <span className="pr5">
        <IncompleteDataNotification incomplete={incomplete} />
      </span>
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
