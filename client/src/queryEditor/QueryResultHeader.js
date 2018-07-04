import React from 'react'
import PropTypes from 'prop-types'
import IncompleteDataNotification from '../common/IncompleteDataNotification'
import SecondsTimer from '../common/SecondsTimer.js'

class QueryResultHeader extends React.Component {
  renderDownloadLinks() {
    const { cacheKey, config } = this.props
    const csvDownloadLink = `${config.baseUrl}/download-results/${cacheKey}.csv`
    const xlsxDownloadLink = `${
      config.baseUrl
    }/download-results/${cacheKey}.xlsx`
    if (config.allowCsvDownload) {
      return (
        <span>
          <span className="gray">Download: </span>
          <a
            className="ml3"
            target="_blank"
            rel="noopener noreferrer"
            href={csvDownloadLink}
          >
            .csv
          </a>
          <a
            className="ml3"
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
      )
    }

    const serverSec = queryResult
      ? queryResult.queryRunTime / 1000 + ' sec.'
      : ''
    const rowCount =
      queryResult && queryResult.rows ? queryResult.rows.length : ''

    const incomplete = queryResult ? queryResult.incomplete : false

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
        <span className="pr5">{this.renderDownloadLinks()}</span>
        <span className="pr5">
          <IncompleteDataNotification incomplete={incomplete} />
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
