import React from 'react'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import IncompleteDataNotification from './components/IncompleteDataNotification'
import QueryResultDataTable from './components/QueryResultDataTable.js'
import fetchJson from './utilities/fetch-json.js'

var QueryEditor = React.createClass({
  getInitialState: function () {
    return {
      isRunning: false,
      runQueryStartTime: undefined,
      queryResult: undefined
    }
  },
  runQuery: function (queryId) {
    this.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    })
    fetchJson('GET', this.props.config.baseUrl + '/api/queries/' + queryId)
      .then((json) => {
        if (json.error) console.error(json.error)
        this.setState({
          query: json.query
        })
      })
      .then(() => {
        return fetchJson('GET', this.props.config.baseUrl + '/api/query-result/' + queryId)
      })
      .then((json) => {
        if (json.error) console.error(json.error)
        this.setState({
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        })
      })
      .catch((ex) => {
        console.error(ex.toString())
        this.setState({
          isRunning: false
        })
      })
  },
  componentDidMount: function () {
    this.runQuery(this.props.queryId)
  },
  render: function () {
    var csvDownloadLink
    var xlsxDownloadLink
    if (this.state.queryResult) {
      csvDownloadLink = this.props.config.baseUrl + '/download-results/' + this.state.queryResult.cacheKey + '.csv'
      xlsxDownloadLink = this.props.config.baseUrl + '/download-results/' + this.state.queryResult.cacheKey + '.xlsx'
    }
    return (
      <div style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
        <h3 style={{marginLeft: 20}}>{(this.state.query ? this.state.query.name : '')}</h3>
        <div style={{position: 'absolute', top: 20, right: 20}}>
          <IncompleteDataNotification queryResult={this.state.queryResult} />
          {(this.state.queryResult && this.props.config.allowCsvDownload ? (
            <DropdownButton title='Export' id='export-dropdown-button' pullRight>
              <MenuItem eventKey='2' target='_blank' href={csvDownloadLink}>csv</MenuItem>
              <MenuItem eventKey='3' target='_blank' href={xlsxDownloadLink}>xlsx</MenuItem>
            </DropdownButton>
          ) : null)}
        </div>
        <div style={{position: 'absolute', top: 60, right: 20, bottom: 20, left: 20, padding: 40}}>
          <QueryResultDataTable
            {...this.props}
            isRunning={this.state.isRunning}
            runQueryStartTime={this.state.runQueryStartTime}
            queryResult={this.state.queryResult}
            queryError={this.state.queryError}
            querySuccess={this.state.querySuccess} />
        </div>
      </div>
    )
  }
})

export default QueryEditor
