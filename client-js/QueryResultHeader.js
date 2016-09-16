var React = require('react')
var SecondsTimer = require('./SecondsTimer.js')
import IncompleteDataNotification from './components/IncompleteDataNotification'

var QueryResultHeader = React.createClass({
  render: function () {
    if (this.props.isRunning || !this.props.queryResult) {
      return (
        <div className='panel-result-header'>
          {(this.props.isRunning ? (
            <span className='panel-result-header-item'>
              <span className='panel-result-header-label'>Query Run Time: </span>
              <span className='panel-result-header-value-DELETE'>
                <SecondsTimer startTime={this.props.runQueryStartTime} /> sec.
              </span>
            </span>
          ) : null)}
        </div>
      )
    }
    var csvDownloadLink = this.props.config.baseUrl + '/download-results/' + this.props.cacheKey + '.csv'
    var xlsxDownloadLink = this.props.config.baseUrl + '/download-results/' + this.props.cacheKey + '.xlsx'
    var serverSec = (this.props.queryResult ? (this.props.queryResult.queryRunTime / 1000) + ' sec.' : '')
    var rowCount = (this.props.queryResult && this.props.queryResult.rows ? this.props.queryResult.rows.length : '')
    var downloadLinks = () => {
      if (this.props.config.allowCsvDownload) {
        return (
          <span>
            <span className='panel-result-header-label'>Download: </span>
            <a className='result-download-link' target='_blank' href={csvDownloadLink}>.csv</a>
            <a className='result-download-link' target='_blank' href={xlsxDownloadLink}>.xlsx</a>
          </span>
        )
      }
    }
    return (
      <div className='panel-result-header'>
        <span className='panel-result-header-item'>
          <span className='panel-result-header-label'>Query Run Time: </span>
          <span className='panel-result-header-value-DELETE'>{serverSec}</span>
        </span>
        <span className='panel-result-header-item'>
          <span className='panel-result-header-label'>Rows: </span>
          <span className='panel-result-header-value-DELETE'>{rowCount}</span>
        </span>
        <span className='panel-result-header-item'>
          {downloadLinks()}
        </span>
        <span className='panel-result-header-item'>
          <IncompleteDataNotification queryResult={this.props.queryResult} />
        </span>
      </div>
    )
  }
})

module.exports = QueryResultHeader
