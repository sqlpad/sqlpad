import React from 'react'
import PropTypes from 'prop-types'
import IncompleteDataNotification from './common/IncompleteDataNotification'
import QueryResultDataTable from './common/QueryResultDataTable.js'
import fetchJson from './utilities/fetch-json.js'

import Icon from 'antd/lib/icon'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'

import Dropdown from 'antd/lib/dropdown'
import 'antd/lib/dropdown/style/css'

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

  renderExportButton() {
    const { queryResult } = this.state
    const { config } = this.props
    const { baseUrl, allowCsvDownload } = config

    if (!queryResult || !allowCsvDownload) {
      return
    }

    const { cacheKey } = queryResult
    const csvDownloadLink = `${baseUrl}/download-results/${cacheKey}.csv`
    const xlsxDownloadLink = `${baseUrl}/download-results/${cacheKey}.xlsx`

    const menu = (
      <Menu>
        <Menu.Item>
          <a target="_blank" href={csvDownloadLink}>
            csv
          </a>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" href={xlsxDownloadLink}>
            xlsx
          </a>
        </Menu.Item>
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
    const {
      isRunning,
      query,
      queryError,
      queryResult,
      querySuccess,
      runQueryStartTime
    } = this.state

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
