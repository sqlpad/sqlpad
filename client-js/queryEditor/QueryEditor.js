import React from 'react'
import Alert from 'react-s-alert'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import keymaster from 'keymaster'
import QueryResultDataTable from '../common/QueryResultDataTable.js'
import SqlpadTauChart from '../common/SqlpadTauChart.js'
import QueryResultHeader from './QueryResultHeader.js'
import QueryDetailsModal from './QueryDetailsModal'
import EditorNavBar from './EditorNavBar'
import FlexTabPane from './FlexTabPane'
import SchemaSidebar from './SchemaSidebar.js'
import VisSidebar from './VisSidebar'
import SqlEditor from '../common/SqlEditor'
import './QueryEditor.css'

const NEW_QUERY = {
  _id: '',
  name: '',
  tags: [],
  connectionId: '',
  queryText: '',
  chartConfiguration: {
    chartType: '',
    fields: {} // key value for chart
  }
}

class QueryEditor extends React.Component {
  state = {
    activeTabKey: 'sql',
    availableTags: [],
    cacheKey: uuid.v1(),
    connections: [],
    isDirty: false,
    isRunning: false,
    isSaving: false,
    query: Object.assign({}, NEW_QUERY),
    queryResult: undefined,
    runQueryStartTime: undefined,
    saveOnClose: false,
    showModal: false
  }

  sqlpadTauChart = undefined

  getTagOptions() {
    const { availableTags, query } = this.state
    const tagOptions = availableTags.map(t => {
      return { value: t, label: t }
    })
    if (query && query.tags) {
      query.tags.forEach(t => {
        tagOptions.push({ value: t, label: t })
      })
    }
    return tagOptions
  }

  loadConnectionsFromServer = () => {
    const { query } = this.state
    fetchJson('GET', '/api/connections/').then(json => {
      const { error, connections } = json
      if (error) {
        Alert.error(error)
      }
      // if only 1 connection auto-select it
      if (connections.length === 1 && query) {
        query.connectionId = connections[0]._id
      }
      this.setState({ connections, query })
    })
  }

  loadQueryFromServer = queryId => {
    fetchJson('GET', `/api/queries/${queryId}`).then(json => {
      const { error, query } = json
      if (error) {
        Alert.error(error)
      }
      this.setState({ query })
    })
  }

  loadTagsFromServer = () => {
    fetchJson('GET', '/api/tags').then(json => {
      const { error, tags } = json
      if (error) {
        Alert.error(error)
      }
      this.setState({ availableTags: tags })
    })
  }

  runQuery = () => {
    const { cacheKey, query } = this.state
    const selectedText = this.editor.session.getTextRange(
      this.editor.getSelectionRange()
    )
    this.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    })
    const postData = {
      connectionId: query.connectionId,
      cacheKey,
      queryName: query.name,
      queryText: selectedText || query.queryText
    }
    fetchJson('POST', '/api/query-result', postData).then(json => {
      if (json.error) Alert.error(json.error)
      this.setState({
        isDirty: false,
        isRunning: false,
        queryError: json.error,
        queryResult: json.queryResult
      })
    })
  }

  saveQuery = () => {
    const { query } = this.state
    const { config } = this.props
    if (!query.name) {
      this.setState({ showModal: true, saveOnClose: true })
      return
    }
    this.setState({ isSaving: true })
    if (query._id) {
      fetchJson('PUT', `/api/queries/${query._id}`, query).then(json => {
        const { error, query } = json
        if (error) {
          Alert.error(error)
          this.setState({ isSaving: false })
          return
        }
        Alert.success('Query Saved')
        this.setState({ isSaving: false, query })
      })
    } else {
      fetchJson('POST', `/api/queries`, query).then(json => {
        const { error, query } = json
        if (error) {
          Alert.error(error)
          this.setState({ isSaving: false })
          return
        }
        window.history.replaceState(
          {},
          query.name,
          `${config.baseUrl}/queries/${query._id}`
        )
        Alert.success('Query Saved')
        this.setState({ isSaving: false, query })
      })
    }
  }

  setQueryState = (field, value) => {
    const { query } = this.state
    query[field] = value
    this.setState({ query })
  }

  handleChartConfigurationFieldsChange = (chartFieldId, queryResultField) => {
    const { query } = this.state
    query.chartConfiguration.fields[chartFieldId] = queryResultField
    this.setState({ query })
  }

  handleChartTypeChange = e => {
    const { query } = this.state
    query.chartConfiguration.chartType = e.target.value
    this.setState({ query })
  }

  handleConnectionChange = connectionId => {
    this.setQueryState('connectionId', connectionId)
  }

  handleModalHide = () => {
    if (this.state.saveOnClose) {
      this.saveQuery()
    }
    this.setState({ showModal: false, saveOnClose: false })
  }

  handleQueryNameChange = name => this.setQueryState('name', name)

  handleQueryNameClick = () => this.setState({ showModal: true })

  handleQueryTagsChange = values =>
    this.setQueryState('tags', values.map(v => v.value))

  handleQueryTextChange = queryText =>
    this.setQueryState('queryText', queryText)

  handleSaveImageClick = e => {
    if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
      this.sqlpadTauChart.chart.fire('exportTo', 'png')
    }
  }

  handleTabSelect = activeTabKey => this.setState({ activeTabKey })

  handleVisualizeClick = () => this.sqlpadTauChart.renderChart(true)

  hasRows = () => {
    const queryResult = this.state.queryResult
    return !!(queryResult && queryResult.rows && queryResult.rows.length)
  }

  isChartable = () => {
    const { isRunning, queryError, activeTabKey } = this.state
    const pending = isRunning || queryError
    return !pending && activeTabKey === 'vis' && this.hasRows()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.queryId === 'new') {
      return this.setState({
        activeTabKey: 'sql',
        queryResult: undefined,
        query: Object.assign({}, NEW_QUERY)
      })
    }
    this.loadQueryFromServer(nextProps.queryId)
  }

  componentDidMount() {
    const { queryId } = this.props

    this.loadConnectionsFromServer()
    this.loadTagsFromServer()
    if (queryId !== 'new') {
      this.loadQueryFromServer(queryId)
    }

    /*  Shortcuts
    ============================================================================== */
    // keymaster doesn't fire on input/textarea events by default
    // since we are only using command/ctrl shortcuts,
    // we want the event to fire all the time for any element
    keymaster.filter = () => true
    keymaster.unbind('ctrl+s, command+s')
    keymaster('ctrl+s, command+s', e => {
      this.saveQuery()
      e.preventDefault()
      return false
    })
    // there should only ever be 1 QueryEditor on the page,
    // but just in case there isn't unbind anything previously bound
    // rather something previously not run than something run more than once
    keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e')
    keymaster('ctrl+r, command+r, ctrl+e, command+e', e => {
      this.runQuery()
      e.preventDefault()
      return false
    })
  }

  componentWillUnmount() {
    keymaster.unbind('ctrl+s, command+s')
    keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e')
  }

  render() {
    const { config } = this.props
    const {
      activeTabKey,
      cacheKey,
      connections,
      isRunning,
      isSaving,
      query,
      queryError,
      queryResult,
      runQueryStartTime,
      runSeconds,
      saveOnClose,
      showModal
    } = this.state

    document.title = query.name || 'New Query'

    return (
      <div className="flex-100" style={{ flexDirection: 'column' }}>
        <EditorNavBar
          activeTabKey={activeTabKey}
          isRunning={isRunning}
          isSaving={isSaving}
          onQueryNameClick={this.handleQueryNameClick}
          onRunClick={this.runQuery}
          onSaveClick={this.saveQuery}
          onTabSelect={this.handleTabSelect}
          queryName={query.name}
        />
        <div className="flex-100" style={{ flexGrow: 1 }}>
          <FlexTabPane tabKey="sql" activeTabKey={activeTabKey}>
            <SchemaSidebar
              {...this.props}
              connectionId={query.connectionId}
              connections={connections}
              onConnectionChange={this.handleConnectionChange}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1
              }}
            >
              <SqlEditor
                config={config}
                value={query.queryText}
                height="50%"
                onChange={this.handleQueryTextChange}
                ref={ref => {
                  this.editor = ref ? ref.editor : null
                }}
              />
              <QueryResultHeader
                {...this.props}
                cacheKey={cacheKey}
                isRunning={isRunning}
                queryResult={queryResult}
                runQueryStartTime={runQueryStartTime}
                runSeconds={runSeconds}
              />
              <div style={{ height: '50%', display: 'flex' }}>
                <QueryResultDataTable
                  {...this.props}
                  isRunning={isRunning}
                  queryError={queryError}
                  queryResult={queryResult}
                />
              </div>
            </div>
          </FlexTabPane>
          <FlexTabPane tabKey="vis" activeTabKey={activeTabKey}>
            <VisSidebar
              isChartable={this.isChartable()}
              onChartConfigurationFieldsChange={
                this.handleChartConfigurationFieldsChange
              }
              onChartTypeChange={this.handleChartTypeChange}
              onSaveImageClick={this.handleSaveImageClick}
              onVisualizeClick={this.handleVisualizeClick}
              query={query}
              queryResult={queryResult}
            />
            <div className="flex-grow-1">
              <SqlpadTauChart
                config={this.props.config}
                isRunning={isRunning}
                query={query}
                queryError={queryError}
                queryResult={queryResult}
                renderChart={this.isChartable()}
                ref={ref => {
                  this.sqlpadTauChart = ref
                }}
              />
            </div>
          </FlexTabPane>
        </div>
        <QueryDetailsModal
          onHide={this.handleModalHide}
          onQueryNameChange={this.handleQueryNameChange}
          onQueryTagsChange={this.handleQueryTagsChange}
          query={query}
          saveOnClose={saveOnClose}
          showModal={showModal}
          tagOptions={this.getTagOptions()}
        />
      </div>
    )
  }
}

export default QueryEditor
