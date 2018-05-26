import React from 'react'
import message from 'antd/lib/message'
import Table from 'antd/lib/table'
import Divider from 'antd/lib/divider'
import Popconfirm from 'antd/lib/popconfirm'
import Button from 'antd/lib/button'
import Select from 'antd/lib/select'
import Tag from 'antd/lib/tag'
import Icon from 'antd/lib/icon'
import uniq from 'lodash.uniq'
import fetchJson from '../utilities/fetch-json.js'
import { Link } from 'react-router-dom'
import chartDefinitions from '../utilities/chartDefinitions'
import SqlEditor from '../common/SqlEditor'
import moment from 'moment'

import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

import 'antd/lib/table/style/css'
import 'antd/lib/divider/style/css'
import 'antd/lib/popconfirm/style/css'
import 'antd/lib/button/style/css'
import 'antd/lib/tag/style/css'

const { Option } = Select
const { Column } = Table

const popoverClasses =
  'flex pa2 shadow-3 br2 bw1 ba b--near-white bg-near-white'

class QueriesView extends React.Component {
  state = {
    queries: [],
    connections: [],
    createdBys: [],
    tags: [],
    searchInput: null,
    selectedConnection: null,
    selectedTags: [],
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

  createdBySorter = (a, b) => a.createdBy.localeCompare(b.createdBy)

  modifiedSorter = (a, b) => {
    return moment(a.modifiedDate).toDate() - moment(b.modifiedDate).toDate()
  }

  modifiedRender = (text, record) => moment(record.modifiedDate).calendar()

  connectionSorter = (a, b) => {
    return a.connectionName.localeCompare(b.connectionName)
  }

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
      selectedTags,
      selectedCreatedBy,
      selectedConnection,
      searchInput,
      tags
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
          sorter={this.connectionSorter}
        />
        <Column
          title="Tags"
          key="tags"
          render={this.tagsRender}
          filterDropdown={
            <div className={popoverClasses}>
              <Select
                mode="multiple"
                ref={ele => (this.tagsFilter = ele)}
                className="w5 pr2"
                placeholder="Filter by tag"
                value={selectedTags}
                onChange={selectedTags => this.setState({ selectedTags })}
              >
                {tags.map(tag => <Option key={tag}>{tag}</Option>)}
              </Select>
            </div>
          }
          filterIcon={
            <Icon
              type="filter"
              style={{
                color:
                  this.state.selectedTags && this.state.selectedTags.length
                    ? '#108ee9'
                    : '#aaa'
              }}
            />
          }
          filterDropdownVisible={this.state.tagFilterDropdownVisible}
          onFilterDropdownVisibleChange={visible => {
            this.setState(
              {
                tagFilterDropdownVisible: visible
              },
              () => this.tagsFilter && this.tagsFilter.focus()
            )
          }}
        />
        <Column
          title="Created by"
          dataIndex="createdBy"
          key="createdBy"
          sorter={this.createdBySorter}
        />
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
    const { connections, createdBys, selectedCreatedBy, tags } = this.state

    const createdBySelectOptions = createdBys.map(createdBy => {
      return (
        <option key={createdBy} value={createdBy}>
          {createdBy}
        </option>
      )
    })
    const tagSelectOptions = tags.map(tag => {
      return (
        <option key={tag} value={tag}>
          {tag}
        </option>
      )
    })
    return (
      <div className="pa2 w-100">
        <Form className="flex w-100">
          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Search</ControlLabel>
            <FormControl
              type="text"
              onChange={e => this.onSearchChange(e.target.value)}
            />
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Tag</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.onTagChange(e.target.value)}
            >
              <option value="">All</option>
              {tagSelectOptions}
            </FormControl>
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Connection</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.onConnectionChange(e.target.value)}
            >
              <option value="">All</option>
              {connections.map(conn => (
                <option key={conn._id} value={conn._id}>
                  {conn.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Created By</ControlLabel>
            <FormControl
              value={selectedCreatedBy}
              componentClass="select"
              onChange={e => this.onCreatedByChange(e.target.value)}
            >
              <option value="">All</option>
              {createdBySelectOptions}
            </FormControl>
          </FormGroup>
        </Form>
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
