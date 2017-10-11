import React from 'react'
import Alert from 'react-s-alert'
import AceEditor from 'react-ace'
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import 'brace/ext/searchbox'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import keymaster from 'keymaster'
import SchemaInfo from '../components/SchemaInfo.js'
import QueryResultDataTable from '../components/QueryResultDataTable.js'
import QueryResultHeader from '../components/QueryResultHeader.js'
import SqlpadTauChart from '../components/SqlpadTauChart.js'
import QueryDetailsModal from './QueryDetailsModal'
import EditorNavBar from './EditorNavBar'
import FlexTabPane from './FlexTabPane'
import VisSidebar from './VisSidebar'

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
    cacheKey: uuid.v1(),
    connections: [],
    availableTags: [],
    isSaving: false,
    isRunning: false,
    isDirty: false,
    runQueryStartTime: undefined,
    showModal: false,
    saveOnClose: false,
    queryResult: undefined,
    query: NEW_QUERY
  }

  loadConnectionsFromServer = () => {
    const { config } = this.props
    const { query } = this.state
    fetchJson('GET', `${config.baseUrl}/api/connections/`)
      .then(json => {
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
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  loadTagsFromServer = () => {
    const { config } = this.props
    fetchJson('GET', `${config.baseUrl}/api/tags`)
      .then(json => {
        const { error, tags } = json
        if (error) {
          Alert.error(error)
        }
        this.setState({ availableTags: tags })
      })
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  loadQueryFromServer = queryId => {
    const { config } = this.props
    fetchJson('GET', `${config.baseUrl}/api/queries/${queryId}`)
      .then(json => {
        const { error, query } = json
        if (error) {
          Alert.error(error)
        }
        this.setState({ query })
      })
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  handleModalHide = () => {
    if (this.state.saveOnClose) {
      this.saveQuery()
    }
    this.setState({ showModal: false, saveOnClose: false })
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
      fetchJson('PUT', `${config.baseUrl}/api/queries/${query._id}`, query)
        .then(json => {
          const { error, query } = json
          if (error) {
            Alert.error(error)
            this.setState({ isSaving: false })
            return
          }
          Alert.success('Query Saved')
          this.setState({ isSaving: false, query })
        })
        .catch(ex => {
          console.error(ex.toString())
          Alert.error('Something is broken')
        })
    } else {
      fetchJson('POST', `${config.baseUrl}/api/queries`, query)
        .then(json => {
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
        .catch(ex => {
          console.error(ex.toString())
          Alert.error('Something is broken')
        })
    }
  }

  handleQueryNameClick = () => this.setState({ showModal: true })

  setQueryState = (field, value) => {
    const { query } = this.state
    query[field] = value
    this.setState({ query })
  }

  onConnectionChange = connectionId => {
    this.setQueryState('connectionId', connectionId)
  }

  onQueryNameChange = name => this.setQueryState('name', name)

  onQueryTagsChange = values =>
    this.setQueryState('tags', values.map(v => v.value))

  onQueryTextChange = queryText => this.setQueryState('queryText', queryText)

  onChartTypeChange = e => {
    const { query } = this.state
    query.chartConfiguration.chartType = e.target.value
    this.setState({ query })
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
    fetchJson('POST', this.props.config.baseUrl + '/api/query-result', postData)
      .then(json => {
        if (json.error) Alert.error(json.error)
        this.setState({
          isDirty: false,
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        })
      })
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  onChartConfigurationFieldsChange = (chartFieldId, queryResultField) => {
    const { query } = this.state
    query.chartConfiguration.fields[chartFieldId] = queryResultField
    this.setState({ query })
  }

  sqlpadTauChart = undefined

  hasRows = () => {
    const queryResult = this.state.queryResult
    return !!(queryResult && queryResult.rows && queryResult.rows.length)
  }

  isChartable = () => {
    const { isRunning, queryError, activeTabKey } = this.state
    const pending = isRunning || queryError
    return !pending && activeTabKey === 'vis' && this.hasRows()
  }

  onVisualizeClick = () => this.sqlpadTauChart.renderChart(true)

  onTabSelect = activeTabKey => this.setState({ activeTabKey })

  onSaveImageClick = e => {
    if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
      this.sqlpadTauChart.chart.fire('exportTo', 'png')
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.queryId === 'new') {
      return this.setState({
        activeTabKey: 'sql',
        queryResult: undefined,
        query: NEW_QUERY
      })
    }
    this.loadQueryFromServer(nextProps.queryId)
  }

  componentDidMount () {
    const { config, queryId } = this.props
    const editor = this.editor

    this.loadConnectionsFromServer()
    this.loadTagsFromServer()
    if (queryId !== 'new') {
      this.loadQueryFromServer(queryId)
    }

    if (editor) {
      editor.focus()

      // augment the built-in behavior of liveAutocomplete
      // built-in behavior only starts autocomplete when at least 1 character has been typed
      // In ace the . resets the prefix token and clears the completer
      // In order to get completions for 'sometable.' we need to fire the completer manually
      editor.commands.on('afterExec', e => {
        if (e.command.name === 'insertstring' && /^[\w.]$/.test(e.args)) {
          if (e.args === '.') {
            editor.execCommand('startAutocomplete')
          }
        }
      })
      if (config.editorWordWrap) {
        editor.session.setUseWrapMode(true)
      }
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

  componentWillUnmount () {
    keymaster.unbind('ctrl+s, command+s')
    keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e')
  }

  render () {
    const {
      activeTabKey,
      availableTags,
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

    document.title = query.name ? query.name : 'New Query'
    const tagOptions = availableTags.map(t => {
      return { value: t, label: t }
    })
    if (query && query.tags) {
      query.tags.forEach(t => {
        tagOptions.push({ value: t, label: t })
      })
    }

    return (
      <div className='flex-100' style={{ flexDirection: 'column' }}>
        <EditorNavBar
          activeTabKey={activeTabKey}
          isRunning={isRunning}
          isSaving={isSaving}
          onQueryNameClick={this.handleQueryNameClick}
          onRunClick={this.runQuery}
          onSaveClick={this.saveQuery}
          onTabSelect={this.onTabSelect}
          queryName={query.name}
        />
        <div className='flex-100' style={{ flexGrow: 1 }}>
          <FlexTabPane tabKey='sql' activeTabKey={activeTabKey}>
            <SchemaInfo
              {...this.props}
              connectionId={query.connectionId}
              connections={connections}
              onConnectionChange={this.onConnectionChange}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1
              }}
            >
              <AceEditor
                editorProps={{ $blockScrolling: Infinity }}
                enableBasicAutocompletion
                enableLiveAutocompletion
                height='50%'
                highlightActiveLine={false}
                mode='sql'
                name='query-ace-editor'
                onChange={this.onQueryTextChange}
                showGutter={false}
                showPrintMargin={false}
                theme='sqlserver'
                value={query.queryText}
                width='100%'
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
          <FlexTabPane tabKey='vis' activeTabKey={activeTabKey}>
            <VisSidebar
              isChartable={this.isChartable()}
              onChartConfigurationFieldsChange={
                this.onChartConfigurationFieldsChange
              }
              onChartTypeChange={this.onChartTypeChange}
              onSaveImageClick={this.onSaveImageClick}
              onVisualizeClick={this.onVisualizeClick}
              query={query}
              queryResult={queryResult}
            />
            <div className='flex-grow-1'>
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
          onQueryNameChange={this.onQueryNameChange}
          onQueryTagsChange={this.onQueryTagsChange}
          query={query}
          saveOnClose={saveOnClose}
          showModal={showModal}
          tagOptions={tagOptions}
        />
        <Alert stack={{ limit: 3 }} position='bottom-right' />
      </div>
    )
  }
}

export default QueryEditor
