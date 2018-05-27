import React from 'react'
import message from 'antd/lib/message'
import Table from 'antd/lib/table'
import Divider from 'antd/lib/divider'
import Popconfirm from 'antd/lib/popconfirm'
import Button from 'antd/lib/button'
import Select from 'antd/lib/select'
import Tag from 'antd/lib/tag'
import Input from 'antd/lib/input'
import uniq from 'lodash.uniq'
import fetchJson from '../utilities/fetch-json.js'
import { Link } from 'react-router-dom'
import chartDefinitions from '../utilities/chartDefinitions'
import SqlEditor from '../common/SqlEditor'
import moment from 'moment'

import 'antd/lib/input/style/css'
import 'antd/lib/table/style/css'
import 'antd/lib/divider/style/css'
import 'antd/lib/popconfirm/style/css'
import 'antd/lib/button/style/css'
import 'antd/lib/tag/style/css'

const { Option } = Select
const { Column } = Table
const { Search } = Input

class QueriesView extends React.Component {
  state = {
    queries: [],
    connections: [],
    createdBys: [],
    tags: [],
    tagFilterDropdownVisible: false,
    searchInput: null,
    selectedTags: [],
    selectedConnection: '',
    selectedCreatedBy: this.props.currentUser
      ? this.props.currentUser.email
      : '',
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
      let selectedCreatedBy = this.state.selectedCreatedBy
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

  onSearchChange = e => {
    this.setState({
      searchInput: e.target.value
    })
  }

  componentDidMount() {
    document.title = 'SQLPad - Queries'
    this.loadConfigValuesFromServer()
  }

  nameRender = (text, record) => {
    return <Link to={'/queries/' + record._id}>{record.name}</Link>
  }

  nameOnCell = record => {
    return {
      onMouseEnter: () => this.handleQueryMouseOver(record),
      onMouseLeave: () => this.handleQueryMouseLeave(record)
    }
  }

  nameSorter = (a, b) => a.name.localeCompare(b.name)

  modifiedSorter = (a, b) => {
    return moment(a.modifiedDate).toDate() - moment(b.modifiedDate).toDate()
  }

  modifiedRender = (text, record) => moment(record.modifiedDate).calendar()

  tagsRender = (text, record) => {
    if (record.tags && record.tags.length) {
      return record.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
    }
  }

  actionsRender = (text, record) => {
    const { config } = this.props
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
        <Popconfirm
          title="Are you sure?"
          onConfirm={e => this.handleQueryDelete(record._id)}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
        >
          <Button icon="delete" type="danger" />
        </Popconfirm>
      </span>
    )
  }

  getDecoratedQueries() {
    const { queries, connections } = this.state

    // Create index of lookups
    // TODO this should come from API
    const connectionsById = connections.reduce((connMap, connection) => {
      connMap[connection._id] = connection
      return connMap
    }, {})

    const chartsByType = chartDefinitions.reduce((chartMap, chartDef) => {
      chartMap[chartDef.chartType] = chartDef
      return chartMap
    }, {})

    return queries.map(query => {
      query.key = query._id

      const connection = connectionsById[query.connectionId]
      query.connectionName = connection ? connection.name : ''

      // This too could be decorated by API?
      const chartType =
        query.chartConfiguration && query.chartConfiguration.chartType
          ? query.chartConfiguration.chartType
          : null

      const chartDefinition = chartsByType[chartType]
      query.chart = chartDefinition ? chartDefinition.chartLabel : ''

      return query
    })
  }

  renderTable() {
    const {
      searchInput,
      selectedConnection,
      selectedCreatedBy,
      selectedTags
    } = this.state

    let filteredQueries = this.getDecoratedQueries()

    if (selectedTags.length) {
      filteredQueries = filteredQueries.filter(q => {
        if (!q.tags || !q.tags.length) {
          return false
        }
        const matchedTags = selectedTags.filter(
          selectedTag => q.tags.indexOf(selectedTag) > -1
        )
        return selectedTags.length === matchedTags.length
      })
    }

    if (searchInput) {
      const terms = searchInput.split(' ')
      const termCount = terms.length
      filteredQueries = filteredQueries.filter(q => {
        let matchedCount = 0
        terms.forEach(term => {
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

    if (selectedConnection) {
      filteredQueries = filteredQueries.filter(
        q => q.connectionId === selectedConnection
      )
    }

    if (selectedCreatedBy) {
      filteredQueries = filteredQueries.filter(
        q => q.createdBy === selectedCreatedBy
      )
    }

    return (
      <Table
        locale={{ emptyText: 'No queries found' }}
        dataSource={filteredQueries}
        pagination={false}
        className="w-100"
      >
        <Column
          title="Name"
          key="name"
          onCell={this.nameOnCell}
          render={this.nameRender}
          sorter={this.nameSorter}
        />
        <Column
          title="Connection"
          key="connection"
          dataIndex="connectionName"
        />
        <Column title="Tags" key="tags" render={this.tagsRender} />
        <Column title="Created by" dataIndex="createdBy" key="createdBy" />
        <Column
          title="Modified"
          key="modifiedCalendar"
          defaultSortOrder="descend"
          sorter={this.modifiedSorter}
          render={this.modifiedRender}
        />
        <Column title="Chart" key="chartType" dataIndex="chart" />
        <Column key="action" render={this.actionsRender} />
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

  renderFilters() {
    const {
      connections,
      createdBys,
      searchInput,
      selectedConnection,
      selectedCreatedBy,
      selectedTags,
      tags
    } = this.state
    return (
      <div className="pa3 w-100 bg-near-white">
        <Search
          className="w-20 mr2"
          placeholder="Search"
          value={searchInput}
          onChange={this.onSearchChange}
        />
        <Select
          className="w-20 mr2"
          placeholder="Filter by connection"
          value={selectedConnection}
          onChange={selectedConnection => this.setState({ selectedConnection })}
        >
          <Option key="all" value="">
            All connections
          </Option>
          {connections.map(c => <Option key={c._id}>{c.name}</Option>)}
        </Select>
        <Select
          className="w-20 mr2"
          mode="multiple"
          placeholder="Filter by tag"
          value={selectedTags}
          onChange={selectedTags => this.setState({ selectedTags })}
        >
          {tags.map(tag => <Option key={tag}>{tag}</Option>)}
        </Select>
        <Select
          className="w-20 mr2"
          placeholder="Filter by created by"
          value={selectedCreatedBy}
          onChange={selectedCreatedBy => this.setState({ selectedCreatedBy })}
        >
          <Option key="all" value="">
            All authors
          </Option>
          {createdBys.map(c => <Option key={c}>{c}</Option>)}
        </Select>
        <Link to={'/queries/new'} className="fr">
          <Button type="primary">New Query</Button>
        </Link>
      </div>
    )
  }

  render() {
    return (
      <div className="v-100 w-100 flex flex-column overflow-y-scroll">
        {this.renderFilters()}
        <div className="pa2">{this.renderTable()}</div>
        {this.renderPreview()}
      </div>
    )
  }
}

export default QueriesView
