import React from 'react'
import PropTypes from 'prop-types'
import IncompleteDataNotification from './common/IncompleteDataNotification'
import fetchJson from './utilities/fetch-json.js'
import SqlpadTauChart from './common/SqlpadTauChart.js'

import Icon from 'antd/lib/icon'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'

import Dropdown from 'antd/lib/dropdown'
import 'antd/lib/dropdown/style/css'

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

  renderExportButton() {
    const { queryResult } = this.state
    const { config } = this.props
    const { baseUrl, allowCsvDownload } = config

    if (!queryResult) {
      return
    }

    const { cacheKey } = queryResult
    const csvDownloadLink = `${baseUrl}/download-results/${cacheKey}.csv`
    const xlsxDownloadLink = `${baseUrl}/download-results/${cacheKey}.xlsx`

    const menu = (
      <Menu>
        <Menu.Item onClick={this.onSaveImageClick}>png</Menu.Item>
        {allowCsvDownload && (
          <Menu.Item>
            <a target="_blank" href={csvDownloadLink}>
              csv
            </a>
          </Menu.Item>
        )}
        {allowCsvDownload && (
          <Menu.Item>
            <a target="_blank" href={xlsxDownloadLink}>
              xlsx
            </a>
          </Menu.Item>
        )}
      </Menu>
    )

    return (
      <Dropdown overlay={menu}>
        <Button>
          Export <Icon type="down" />
        </Button>
      </Dropdown>
    )
  }

  render() {
    const { query, queryResult, queryError, isRunning } = this.state
    const { config } = this.props

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
            {this.renderExportButton()}
          </div>
        </div>
        <div style={{ height: '100%', display: 'flex' }}>
          <SqlpadTauChart
            query={query}
            config={config}
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
  config: PropTypes.object.isRequired
}

export default QueryChartOnly
