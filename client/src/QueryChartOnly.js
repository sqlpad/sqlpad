import PropTypes from 'prop-types'
import React from 'react'
import ExportButton from './common/ExportButton.js'
import IncompleteDataNotification from './common/IncompleteDataNotification'
import SqlpadTauChart from './common/SqlpadTauChart.js'
import fetchJson from './utilities/fetch-json.js'

class QueryChartOnly extends React.Component {
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

  onSaveImageClick = e => {
    if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
      this.sqlpadTauChart.chart.fire('exportTo', 'png')
    }
  }

  hasRows = () => {
    var queryResult = this.state.queryResult
    return !!(queryResult && queryResult.rows && queryResult.rows.length)
  }

  isChartable = () => {
    var pending = this.state.isRunning || this.state.queryError
    return !pending && this.hasRows()
  }

  render() {
    const { query, queryResult, queryError, isRunning } = this.state

    const incomplete = queryResult ? queryResult.incomplete : false
    const cacheKey = queryResult ? queryResult.cacheKey : null

    return (
      <div
        className="flex w-100"
        style={{ flexDirection: 'column', padding: '16px' }}
      >
        <div style={{ height: '50px' }}>
          <span className="f2">{query ? query.name : ''}</span>
          <div style={{ float: 'right' }}>
            <IncompleteDataNotification incomplete={incomplete} />
            <ExportButton
              cacheKey={cacheKey}
              onSaveImageClick={this.onSaveImageClick}
            />
          </div>
        </div>
        <div style={{ height: '100%', display: 'flex' }}>
          <SqlpadTauChart
            query={query}
            queryResult={queryResult}
            queryError={queryError}
            isRunning={isRunning}
            renderChart={this.isChartable()}
            ref={ref => {
              this.sqlpadTauChart = ref
            }}
          />
        </div>
      </div>
    )
  }
}

QueryChartOnly.propTypes = {
  queryId: PropTypes.string.isRequired
}

export default QueryChartOnly
