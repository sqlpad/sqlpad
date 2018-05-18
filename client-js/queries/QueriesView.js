import React from 'react'
import message from 'antd/lib/message'
import Table from 'antd/lib/table'
import Divider from 'antd/lib/divider'
import uniq from 'lodash.uniq'
import sortBy from 'lodash.sortby'
import fetchJson from '../utilities/fetch-json.js'
import QueriesFilters from './QueriesFilters'
import { Link } from 'react-router-dom'
import chartDefinitions from '../utilities/chartDefinitions'
import SqlEditor from '../common/SqlEditor'
import moment from 'moment'
import DeleteButton from '../common/DeleteButton'

import 'antd/lib/table/style/css'
import 'antd/lib/divider/style/css'

const { Column } = Table

class QueriesView extends React.Component {
  state = {
    queries: [],
    connections: [],
    createdBys: [],
    tags: [],
    searchInput: null,
    selectedConnection: null,
    selectedTag: null,
    selectedCreatedBy: this.props.currentUser
      ? this.props.currentUser.email
      : '',
    selectedSortBy: null,
    selectedQuery: null
  }

  handleQueryMouseOver = query => {
    this.setState({ selectedQuery: query })
  }

  handleQueryMouseLeave = query => {
    this.setState({ selectedQuery: null })
  }

  handleQueryDelete = queryId => {
    let { queries, selectedQuery } = this.state
    if (selectedQuery && selectedQuery._id === queryId) {
      selectedQuery = null
    }
    queries = queries.filter(q => {
      return q._id !== queryId
    })
    this.setState({
      queries: queries,
      selectedQuery: selectedQuery
    })
    fetchJson('DELETE', '/api/queries/' + queryId).then(json => {
      if (json.error) message.error(json.error)
    })
  }

  loadConfigValuesFromServer = () => {
    fetchJson('GET', '/api/queries').then(json => {
      const queries = json.queries || []
      const createdBys = uniq(queries.map(q => q.createdBy))
      const tags = uniq(
        queries
          .map(q => q.tags)
          .reduce((a, b) => a.concat(b), [])
          .filter(tag => tag)
      )
      var selectedCreatedBy = this.state.selectedCreatedBy
      if (createdBys.indexOf(this.props.currentUser.email) === -1) {
        selectedCreatedBy = ''
      }
      this.setState({
        queries: json.queries,
        createdBys: createdBys,
        selectedCreatedBy: selectedCreatedBy,
        tags: tags
      })
    })
    fetchJson('GET', '/api/connections').then(json => {
      this.setState({ connections: json.connections })
    })
  }

  onSearchChange = searchInput => {
    this.setState({
      searchInput: searchInput,
      selectedQuery: null
    })
  }

  onConnectionChange = connectionId => {
    this.setState({
      selectedConnection: connectionId,
      selectedQuery: null
    })
  }

  onTagChange = tag => {
    this.setState({
      selectedTag: tag,
      selectedQuery: null
    })
  }

  onCreatedByChange = createdBy => {
    this.setState({
      selectedCreatedBy: createdBy,
      selectedQuery: null
    })
  }

  onSortByChange = sortBy => {
    this.setState({
      selectedSortBy: sortBy
    })
  }

  componentDidMount() {
    document.title = 'SQLPad - Queries'
    this.loadConfigValuesFromServer()
  }

  renderTable() {
    const { config } = this.props
    const {
      queries,
      selectedTag,
      selectedCreatedBy,
      selectedConnection,
      searchInput,
      selectedSortBy
    } = this.state

    let filteredQueries = queries.map(q => {
      q.key = q._id
      return q
    })
    if (selectedTag) {
      filteredQueries = filteredQueries.filter(q => {
        return q.tags && q.tags.length && q.tags.indexOf(selectedTag) > -1
      })
    }
    if (selectedCreatedBy) {
      filteredQueries = filteredQueries.filter(q => {
        return q.createdBy === selectedCreatedBy
      })
    }
    if (selectedConnection) {
      filteredQueries = filteredQueries.filter(q => {
        return q.connectionId === selectedConnection
      })
    }
    if (searchInput) {
      var terms = searchInput.split(' ')
      var termCount = terms.length
      filteredQueries = filteredQueries.filter(q => {
        var matchedCount = 0
        terms.forEach(function(term) {
          term = term.toLowerCase()
          if (
            (q.name && q.name.toLowerCase().search(term) !== -1) ||
            (q.queryText && q.queryText.toLowerCase().search(term) !== -1)
          ) {
            matchedCount++
          }
        })
        return matchedCount === termCount
      })
    }
    if (selectedSortBy === 'name') {
      filteredQueries = sortBy(filteredQueries, query =>
        query.name.toLowerCase()
      )
    } else {
      filteredQueries = sortBy(filteredQueries, 'modifiedDate').reverse()
    }

    const decorated = filteredQueries.map(query => {
      const chartType =
        query.chartConfiguration && query.chartConfiguration.chartType
          ? query.chartConfiguration.chartType
          : null

      const chartDefinition = chartDefinitions.find(
        def => def.chartType === chartType
      )

      query.chartLabel = chartDefinition ? chartDefinition.chartLabel : null

      return query
    })

    return (
      <Table
        locale={{ emptyText: 'No queries found' }}
        dataSource={decorated}
        pagination={false}
        className="w-100"
      >
        <Column
          title="Name"
          key="name"
          onCell={record => {
            return {
              onMouseEnter: () => this.handleQueryMouseOver(record),
              onMouseLeave: () => this.handleQueryMouseLeave(record)
            }
          }}
          render={(text, record) => {
            return <Link to={'/queries/' + record._id}>{record.name}</Link>
          }}
        />
        <Column title="Created by" dataIndex="createdBy" key="createdBy" />
        <Column
          title="Modified"
          key="modifiedCalendar"
          render={(text, record) => {
            return moment(record.modifiedDate).calendar()
          }}
        />
        <Column
          title="Chart"
          key="chartType"
          render={(text, record) => {
            const chartType =
              record.chartConfiguration && record.chartConfiguration.chartType
                ? record.chartConfiguration.chartType
                : null

            const chartDefinition = chartDefinitions.find(
              def => def.chartType === chartType
            )

            return chartDefinition ? chartDefinition.chartLabel : null
          }}
        />
        <Column
          title="Actions"
          key="action"
          render={(text, record) => {
            const tableUrl = `${config.baseUrl}/query-table/${record._id}`
            const chartUrl = `${config.baseUrl}/query-chart/${record._id}`
            return (
              <span>
                <a href={tableUrl} target="_blank" rel="noopener noreferrer">
                  table
                </a>
                <Divider type="vertical" />
                <a href={chartUrl} target="_blank" rel="noopener noreferrer">
                  chart
                </a>
                <Divider type="vertical" />
                <DeleteButton
                  onClick={() => this.handleQueryDelete(record._id)}
                />
              </span>
            )
          }}
        />
      </Table>
    )
  }

  renderPreview() {
    const { config } = this.props
    const { selectedQuery } = this.state
    if (selectedQuery) {
      return (
        <div
          className="pa2 w-50 shadow-1 br2 bw4 ba b--black absolute flex flex-column bg-white"
          style={{ top: 150, bottom: 20, right: 20 }}
        >
          <SqlEditor config={config} readOnly value={selectedQuery.queryText} />
        </div>
      )
    }
  }

  render() {
    const { currentUser } = this.props
    const { connections, createdBys, selectedCreatedBy, tags } = this.state

    return (
      <div className="v-100 w-100 flex flex-column">
        <QueriesFilters
          currentUser={currentUser}
          connections={connections}
          onConnectionChange={this.onConnectionChange}
          tags={tags}
          onSearchChange={this.onSearchChange}
          onTagChange={this.onTagChange}
          createdBys={createdBys}
          onCreatedByChange={this.onCreatedByChange}
          onSortByChange={this.onSortByChange}
          selectedCreatedBy={selectedCreatedBy}
        />

        <div className="pa2 v-100 w-100 flex overflow-y-scroll">
          {this.renderTable()}
        </div>
        {this.renderPreview()}
      </div>
    )
  }
}

export default QueriesView
