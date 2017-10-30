import React from 'react'
import PropTypes from 'prop-types'
import IncompleteDataNotification from '../common/IncompleteDataNotification'
import SecondsTimer from '../common/SecondsTimer.js'
import './QueryResultHeader.css'

class QueryResultHeader extends React.Component {
  renderDownloadLinks() {
    const { cacheKey, config } = this.props
    const csvDownloadLink = `${config.baseUrl}/download-results/${cacheKey}.csv`
    const xlsxDownloadLink = `${config.baseUrl}/download-results/${cacheKey}.xlsx`
    if (config.allowCsvDownload) {
      return (
        <span>
          <span className="panel-result-header-label">Download: </span>
          <a
            className="result-download-link"
            target="_blank"
            rel="noopener noreferrer"
            href={csvDownloadLink}
          >
            .csv
          </a>
          <a
            className="result-download-link"
            target="_blank"
            rel="noopener noreferrer"
            href={xlsxDownloadLink}
          >
            .xlsx
          </a>
        </span>
      )
    }
  }

  render() {
    const { isRunning, queryResult, runQueryStartTime } = this.props
    if (isRunning || !queryResult) {
      return (
        <div className="panel-result-header">
          {isRunning ? (
            <span className="panel-result-header-item">
              <span className="panel-result-header-label">
                Query Run Time:{' '}
              </span>
              <span>
                <SecondsTimer startTime={runQueryStartTime} /> sec.
              </span>
            </span>
          ) : null}
        </div>
      )
    }

    const serverSec = queryResult
      ? queryResult.queryRunTime / 1000 + ' sec.'
      : ''
    const rowCount =
      queryResult && queryResult.rows ? queryResult.rows.length : ''

    return (
      <div className="panel-result-header">
        <span className="panel-result-header-item">
          <span className="panel-result-header-label">Query Run Time: </span>
          {serverSec}
        </span>
        <span className="panel-result-header-item">
          <span className="panel-result-header-label">Rows: </span>
          {rowCount}
        </span>
        <span className="panel-result-header-item">
          {this.renderDownloadLinks()}
        </span>
        <span className="panel-result-header-item">
          <IncompleteDataNotification queryResult={queryResult} />
        </span>
      </div>
    )
  }
}

QueryResultHeader.propTypes = {
  cacheKey: PropTypes.string,
  config: PropTypes.object,
  isRunning: PropTypes.bool,
  queryResult: PropTypes.object,
  runQueryStartTime: PropTypes.instanceOf(Date)
}

QueryResultHeader.defaultProps = {
  cacheKey: '',
  config: {},
  isRunning: false
}

export default QueryResultHeader
