import React from 'react'
import Alert from 'react-s-alert'
import uniq from 'lodash.uniq'
import sortBy from 'lodash.sortby'
import fetchJson from '../utilities/fetch-json.js'
import QueryList from './QueryList'
import QueryPreview from './QueryPreview'
import QueryListSidebar from './QueryListSidebar'

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

  handleQueryListRowMouseOver = query => {
    this.setState({ selectedQuery: query })
  }

  handleQueryDelete = queryId => {
    var queries = this.state.queries
    var selectedQuery = this.state.selectedQuery
    if (selectedQuery._id === queryId) selectedQuery = null
    queries = queries.filter(q => {
      return q._id !== queryId
    })
    this.setState({
      queries: queries,
      selectedQuery: selectedQuery
    })
    fetchJson('DELETE', '/api/queries/' + queryId).then(json => {
      if (json.error) Alert.error(json.error)
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

  render() {
    let filteredQueries = this.state.queries.map(q => q)
    if (this.state.selectedTag) {
      filteredQueries = filteredQueries.filter(q => {
        return (
          q.tags && q.tags.length && q.tags.indexOf(this.state.selectedTag) > -1
        )
      })
    }
    if (this.state.selectedCreatedBy) {
      filteredQueries = filteredQueries.filter(q => {
        return q.createdBy === this.state.selectedCreatedBy
      })
    }
    if (this.state.selectedConnection) {
      filteredQueries = filteredQueries.filter(q => {
        return q.connectionId === this.state.selectedConnection
      })
    }
    if (this.state.searchInput) {
      var terms = this.state.searchInput.split(' ')
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
    if (this.state.selectedSortBy === 'name') {
      filteredQueries = sortBy(filteredQueries, query =>
        query.name.toLowerCase()
      )
    } else {
      filteredQueries = sortBy(filteredQueries, 'modifiedDate').reverse()
    }

    return (
      <div className="v-100 w-100 flex">
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
          selectedCreatedBy={this.state.selectedCreatedBy}
        />
        <QueryList
          config={this.props.config}
          queries={filteredQueries}
          selectedQuery={this.state.selectedQuery}
          handleQueryDelete={this.handleQueryDelete}
          handleQueryListRowMouseOver={this.handleQueryListRowMouseOver}
        />
        <QueryPreview
          config={this.props.config}
          selectedQuery={this.state.selectedQuery}
        />
      </div>
    )
  }
}

export default QueriesView
