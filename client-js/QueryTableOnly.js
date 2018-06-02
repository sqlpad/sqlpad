import React from 'react'
import PropTypes from 'prop-types'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import IncompleteDataNotification from './common/IncompleteDataNotification'
import QueryResultDataTable from './common/QueryResultDataTable.js'
import fetchJson from './utilities/fetch-json.js'

class QueryTableOnly extends React.Component {
  state = {
    isRunning: false,
    runQueryStartTime: undefined,
    queryResult: undefined
  }

  runQuery = queryId => {
    this.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    })
    fetchJson('GET', '/api/queries/' + queryId)
      .then(json => {
        if (json.error) console.error(json.error)
        this.setState({
          query: json.query
        })
      })
      .then(() => {
        return fetchJson('GET', '/api/query-result/' + queryId)
      })
      .then(json => {
        if (json.error) console.error(json.error)
        this.setState({
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        })
      })
  }

  componentDidMount() {
    document.title = 'SQLPad'
    this.runQuery(this.props.queryId)
  }

  render() {
    const {
      isRunning,
      query,
      queryError,
      queryResult,
      querySuccess,
      runQueryStartTime
    } = this.state
    const { config } = this.props
    const { baseUrl, allowCsvDownload } = config

    let csvDownloadLink
    let xlsxDownloadLink
    if (queryResult) {
      const { cacheKey } = queryResult
      csvDownloadLink = `${baseUrl}/download-results/${cacheKey}.csv`
      xlsxDownloadLink = `${baseUrl}/download-results/${cacheKey}.xlsx`
    }

    const incomplete = queryResult ? queryResult.incomplete : false

    return (
      <div
        className="flex w-100"
        style={{ flexDirection: 'column', padding: '16px' }}
      >
        <div style={{ height: '50px' }}>
          <span className="f2">{query ? query.name : ''}</span>
          <div style={{ float: 'right' }}>
            <IncompleteDataNotification incomplete={incomplete} />
            {queryResult && allowCsvDownload ? (
              <DropdownButton
                title="Export"
                id="export-dropdown-button"
                pullRight
              >
                <MenuItem eventKey="2" target="_blank" href={csvDownloadLink}>
                  csv
                </MenuItem>
                <MenuItem eventKey="3" target="_blank" href={xlsxDownloadLink}>
                  xlsx
                </MenuItem>
              </DropdownButton>
            ) : null}
          </div>
        </div>
        <div className="flex h-100 ba b--moon-gray">
          <div className="relative w-100">
            <QueryResultDataTable
              {...this.props}
              isRunning={isRunning}
              runQueryStartTime={runQueryStartTime}
              queryResult={queryResult}
              queryError={queryError}
              querySuccess={querySuccess}
            />
          </div>
        </div>
      </div>
    )
  }
}

QueryTableOnly.propTypes = {
  config: PropTypes.object.isRequired
}

export default QueryTableOnly
