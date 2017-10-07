import React from 'react'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import IncompleteDataNotification from './components/IncompleteDataNotification'
import QueryResultDataTable from './components/QueryResultDataTable.js'
import fetchJson from './utilities/fetch-json.js'

class QueryEditor extends React.Component {
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
    fetchJson('GET', this.props.config.baseUrl + '/api/queries/' + queryId)
      .then(json => {
        if (json.error) console.error(json.error)
        this.setState({
          query: json.query
        })
      })
      .then(() => {
        return fetchJson(
          'GET',
          this.props.config.baseUrl + '/api/query-result/' + queryId
        )
      })
      .then(json => {
        if (json.error) console.error(json.error)
        this.setState({
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        })
      })
      .catch(ex => {
        console.error(ex.toString())
        this.setState({
          isRunning: false
        })
      })
  }

  componentDidMount () {
    this.runQuery(this.props.queryId)
  }

  render () {
    var csvDownloadLink
    var xlsxDownloadLink
    if (this.state.queryResult) {
      csvDownloadLink =
        this.props.config.baseUrl +
        '/download-results/' +
        this.state.queryResult.cacheKey +
        '.csv'
      xlsxDownloadLink =
        this.props.config.baseUrl +
        '/download-results/' +
        this.state.queryResult.cacheKey +
        '.xlsx'
    }
    return (
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
        <div>
          <h3 style={{ marginLeft: 20, display: 'inline-block' }}>
            {this.state.query ? this.state.query.name : ''}
          </h3>
          <div style={{ float: 'right', marginTop: 20, marginRight: 20 }}>
            <IncompleteDataNotification queryResult={this.state.queryResult} />
            {this.state.queryResult && this.props.config.allowCsvDownload
              ? <DropdownButton
                title='Export'
                id='export-dropdown-button'
                pullRight
                >
                <MenuItem eventKey='2' target='_blank' href={csvDownloadLink}>
                    csv
                  </MenuItem>
                <MenuItem
                  eventKey='3'
                  target='_blank'
                  href={xlsxDownloadLink}
                  >
                    xlsx
                  </MenuItem>
              </DropdownButton>
              : null}
          </div>
        </div>
        <div
          style={{
            padding: 20,
            height: 400
          }}
        >
          <QueryResultDataTable
            {...this.props}
            isRunning={this.state.isRunning}
            runQueryStartTime={this.state.runQueryStartTime}
            queryResult={this.state.queryResult}
            queryError={this.state.queryError}
            querySuccess={this.state.querySuccess}
          />
        </div>
      </div>
    )
  }
}

export default QueryEditor
