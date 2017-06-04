import React from 'react'
import moment from 'moment'
import Alert from 'react-s-alert'
import AceEditor from 'react-ace'
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import Label from 'react-bootstrap/lib/Label'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import navigateToClickHandler from './utilities/navigateToClickHandler'
import fetchJson from './utilities/fetch-json.js'
import chartDefinitions from './components/ChartDefinitions.js'
const _ = window._

const FilterableQueryList = React.createClass({
  getInitialState: function () {
    return {
      queries: [],
      connections: [],
      createdBys: [],
      tags: [],
      searchInput: null,
      selectedConnection: null,
      selectedTag: null,
      selectedCreatedBy: this.props.currentUser ? this.props.currentUser.email : '',
      selectedSortBy: null,
      selectedQuery: null
    }
  },
  handleQueryListRowMouseOver: function (query) {
    this.setState({selectedQuery: query})
  },
  handleQueryDelete: function (queryId) {
    var queries = this.state.queries
    var selectedQuery = this.state.selectedQuery
    if (selectedQuery._id === queryId) selectedQuery = null
    queries = queries.filter((q) => {
      return q._id !== queryId
    })
    this.setState({
      queries: queries,
      selectedQuery: selectedQuery
    })
    fetchJson('DELETE', this.props.config.baseUrl + '/api/queries/' + queryId)
      .then((json) => {
        if (json.error) Alert.error(json.error)
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  loadConfigValuesFromServer: function () {
    fetchJson('GET', this.props.config.baseUrl + '/api/queries')
      .then((json) => {
        var createdBys = _.uniq(_.pluck(json.queries, 'createdBy'))
        var tags = _.compact(_.uniq(_.flatten(_.pluck(json.queries, 'tags'))))
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
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
    fetchJson('GET', this.props.config.baseUrl + '/api/connections')
      .then((json) => {
        this.setState({connections: json.connections})
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  onSearchChange: function (searchInput) {
    this.setState({
      searchInput: searchInput,
      selectedQuery: null
    })
  },
  onConnectionChange: function (connectionId) {
    this.setState({
      selectedConnection: connectionId,
      selectedQuery: null
    })
  },
  onTagChange: function (tag) {
    this.setState({
      selectedTag: tag,
      selectedQuery: null
    })
  },
  onCreatedByChange: function (createdBy) {
    this.setState({
      selectedCreatedBy: createdBy,
      selectedQuery: null
    })
  },
  onSortByChange: function (sortBy) {
    this.setState({
      selectedSortBy: sortBy
    })
  },
  componentDidMount: function () {
    this.loadConfigValuesFromServer()
  },
  render: function () {
    var filteredQueries = this.state.queries.map((q) => q)
    if (this.state.selectedTag) {
      filteredQueries = filteredQueries.filter((q) => {
        return (q.tags && q.tags.length && q.tags.indexOf(this.state.selectedTag) > -1)
      })
    }
    if (this.state.selectedCreatedBy) {
      filteredQueries = filteredQueries.filter((q) => {
        return (q.createdBy === this.state.selectedCreatedBy)
      })
    }
    if (this.state.selectedConnection) {
      filteredQueries = filteredQueries.filter((q) => {
        return (q.connectionId === this.state.selectedConnection)
      })
    }
    if (this.state.searchInput) {
      var terms = this.state.searchInput.split(' ')
      var termCount = terms.length
      filteredQueries = filteredQueries.filter((q) => {
        var matchedCount = 0
        terms.forEach(function (term) {
          term = term.toLowerCase()
          if ((q.name && q.name.toLowerCase().search(term) !== -1) || (q.queryText && q.queryText.toLowerCase().search(term) !== -1)) matchedCount++
        })
        return (matchedCount === termCount)
      })
    }
    if (this.state.selectedSortBy === 'name') {
      filteredQueries = _.sortBy(filteredQueries, (query) => query.name.toLowerCase())
    } else {
      filteredQueries = _.sortBy(filteredQueries, 'modifiedDate').reverse()
    }

    return (
      <div className='QueryListContainer'>
        <QueryListSidebar
          currentUser={this.props.currentUser}
          connections={this.state.connections}
          onConnectionChange={this.onConnectionChange}
          tags={this.state.tags}
          onSearchChange={this.onSearchChange}
          onTagChange={this.onTagChange}
          createdBys={this.state.createdBys}
          onCreatedByChange={this.onCreatedByChange}
          onSortByChange={this.onSortByChange}
          selectedCreatedBy={this.state.selectedCreatedBy} />
        <QueryList
          config={this.props.config}
          queries={filteredQueries}
          selectedQuery={this.state.selectedQuery}
          handleQueryDelete={this.handleQueryDelete}
          handleQueryListRowMouseOver={this.handleQueryListRowMouseOver} />
        <QueryPreview
          config={this.props.config}
          selectedQuery={this.state.selectedQuery} />
      </div>
    )
  }
})

var QueryListSidebar = React.createClass({
  onSearchChange: function (e) {
    this.props.onSearchChange(e.target.value)
  },
  onConnectionChange: function (e) {
    this.props.onConnectionChange(e.target.value)
  },
  onTagChange: function (e) {
    this.props.onTagChange(e.target.value)
  },
  onCreatedByChange: function (e) {
    this.props.onCreatedByChange(e.target.value)
  },
  onSortByChange: function (e) {
    this.props.onSortByChange(e.target.value)
  },
  render: function () {
    var connectionSelectOptions = this.props.connections.map(function (conn) {
      return (
        <option key={conn._id} value={conn._id}>{conn.name}</option>
      )
    })
    var createdBySelectOptions = this.props.createdBys.map(function (createdBy) {
      return (
        <option key={createdBy} value={createdBy}>{createdBy}</option>
      )
    })
    var tagSelectOptions = this.props.tags.map(function (tag) {
      return (
        <option key={tag} value={tag}>{tag}</option>
      )
    })
    return (
      <div className='QueryListSidebar'>
        <Form >
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>Search</ControlLabel>
            <FormControl type='text' onChange={this.onSearchChange} />
          </FormGroup>
          <br />
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>Tag</ControlLabel>
            <FormControl componentClass='select' onChange={this.onTagChange}>
              <option value=''>All</option>
              {tagSelectOptions}
            </FormControl>
          </FormGroup>
          <br />
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>Connection</ControlLabel>
            <FormControl componentClass='select' onChange={this.onConnectionChange}>
              <option value=''>All</option>
              {connectionSelectOptions}
            </FormControl>
          </FormGroup>
          <br />
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>Created By</ControlLabel>
            <FormControl value={this.props.selectedCreatedBy} componentClass='select' onChange={this.onCreatedByChange}>
              <option value=''>All</option>
              {createdBySelectOptions}
            </FormControl>
          </FormGroup>
          <br />
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>Sort By</ControlLabel>
            <FormControl componentClass='select' onChange={this.onSortByChange}>
              <option value='modifiedDate'>Modified Date</option>
              <option value='name'>Name</option>
            </FormControl>
          </FormGroup>
        </Form>
      </div>
    )
  }
})

var QueryList = React.createClass({
  render: function () {
    var self = this
    var QueryListRows = this.props.queries.map((query) => {
      return (
        <QueryListRow
          config={this.props.config}
          key={query._id}
          query={query}
          selectedQuery={this.props.selectedQuery}
          handleQueryDelete={this.props.handleQueryDelete}
          handleQueryListRowMouseOver={self.props.handleQueryListRowMouseOver} />
      )
    })
    return (
      <div className='QueryList'>
        <ControlLabel>Queries</ControlLabel>
        <ListGroup className='QueryListContents'>
          {QueryListRows}
        </ListGroup>
      </div>
    )
  }
})

var QueryListRow = React.createClass({
  getInitialState: function () {
    return {
      showPreview: false
    }
  },
  onMouseOver: function (e) {
    this.props.handleQueryListRowMouseOver(this.props.query)
  },
  onDelete: function (e) {
    this.props.handleQueryDelete(this.props.query._id)
  },
  render: function () {
    var tagLabels = this.props.query.tags.map((tag) => {
      return (
        <Label bsStyle='info' key={tag} style={{marginLeft: 4}}>{tag}</Label>
      )
    })
    var tableUrl = this.props.config.baseUrl + '/query-table/' + this.props.query._id
    var chartUrl = this.props.config.baseUrl + '/query-chart/' + this.props.query._id
    var selectedStyle = () => {
      if (this.props.selectedQuery && this.props.selectedQuery._id === this.props.query._id) {
        return 'list-group-item QueryListRow QueryListRowSelected'
      } else {
        return 'list-group-item QueryListRow'
      }
    }
    const popoverClick = (
      <Popover id='popover-trigger-click' title='Are you sure?'>
        <Button bsStyle='danger' onClick={this.onDelete} style={{width: '100%'}}>delete</Button>
      </Popover>
    )
    return (
      <li
        onClick={this.onClick}
        className={selectedStyle()}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut} >
        <h4><a onClick={navigateToClickHandler('/queries/' + this.props.query._id)} href='#query' >{this.props.query.name}</a></h4>
        <p>{this.props.query.createdBy} {tagLabels}</p>
        <p>
          <a href={tableUrl} target='_blank' rel='noopener noreferrer'>table</a>
          {' '}
          <a href={chartUrl} target='_blank' rel='noopener noreferrer'>chart</a>
        </p>
        <OverlayTrigger trigger='click' placement='left' container={this} rootClose overlay={popoverClick}>
          <a className='QueryListRowDeleteButton' href='#delete'><Glyphicon glyph='trash' /></a>
        </OverlayTrigger>
      </li>
    )
  }
})

var QueryPreview = React.createClass({
  render: function () {
    if (this.props.selectedQuery) {
      if (this.editor && this.props.config.editorWordWrap) {
        this.editor.session.setUseWrapMode(true)
      }
      var query = this.props.selectedQuery
      var chartTypeLabel = () => {
        var chartType = (query.chartConfiguration && query.chartConfiguration.chartType ? query.chartConfiguration.chartType : null)
        var chartDefinition = _.findWhere(chartDefinitions, {chartType: chartType})
        return (chartDefinition ? <h4>Chart: {chartDefinition.chartLabel}</h4> : null)
      }
      return (
        <div className='QueryPreview'>
          <ControlLabel>Preview</ControlLabel>
          <h4>{this.props.selectedQuery.name}</h4>
          <AceEditor
            mode='sql'
            theme='sqlserver'
            name='query-preview-ace-editor'
            width='100%'
            height='70%'
            readOnly
            showGutter={false}
            showPrintMargin={false}
            highlightActiveLine={false}
            value={this.props.selectedQuery.queryText}
            editorProps={{$blockScrolling: true}}
            ref={(ref) => {
              this.editor = (ref ? ref.editor : null)
            }}
          />
          {chartTypeLabel()}
          <h4>Modified: {moment(query.modifiedDate).calendar()}</h4>
          <h4>Created By: {query.createdBy}</h4>
        </div>
      )
    } else {
      return (
        <div className='QueryPreview' />
      )
    }
  }
})

export default FilterableQueryList
