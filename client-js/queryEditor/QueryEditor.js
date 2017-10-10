import React from 'react'
import Alert from 'react-s-alert'
import AceEditor from 'react-ace'
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import 'brace/ext/searchbox'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import keymaster from 'keymaster'
import SchemaInfo from '../components/SchemaInfo.js'
import QueryResultDataTable from '../components/QueryResultDataTable.js'
import QueryResultHeader from '../components/QueryResultHeader.js'
import ChartInputs from '../components/ChartInputs.js'
import SqlpadTauChart from '../components/SqlpadTauChart.js'
import chartDefinitions from '../components/ChartDefinitions.js'
import QueryDetailsModal from './QueryDetailsModal'
import EditorNavBar from './EditorNavBar'

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
    const chartOptions = chartDefinitions.map(d => {
      return (
        <option key={d.chartType} value={d.chartType}>
          {d.chartLabel}
        </option>
      )
    })
    const sqlDisplay = activeTabKey === 'sql' ? 'flex' : 'none'
    const visDisplay = activeTabKey === 'vis' ? 'flex' : 'none'

    return (
      <div className='flex-100' style={{ flexDirection: 'column' }}>
        <EditorNavBar
          activeTabKey={activeTabKey}
          onTabSelect={this.onTabSelect}
          isSaving={isSaving}
          isRunning={isRunning}
          onQueryNameClick={this.handleQueryNameClick}
          onSaveClick={this.saveQuery}
          onRunClick={this.runQuery}
          queryName={query.name}
        />
        <div className='flex-100' style={{ flexGrow: 1 }}>
          <div style={{ display: sqlDisplay, width: '100%' }}>
            <SchemaInfo
              {...this.props}
              connections={connections}
              connectionId={query.connectionId}
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
                mode='sql'
                theme='sqlserver'
                name='query-ace-editor'
                width='100%'
                height='50%'
                showGutter={false}
                showPrintMargin={false}
                highlightActiveLine={false}
                onChange={this.onQueryTextChange}
                value={query.queryText}
                editorProps={{ $blockScrolling: Infinity }}
                enableBasicAutocompletion
                enableLiveAutocompletion
                ref={ref => {
                  this.editor = ref ? ref.editor : null
                }}
              />
              <QueryResultHeader
                {...this.props}
                isRunning={isRunning}
                runQueryStartTime={runQueryStartTime}
                cacheKey={cacheKey}
                runSeconds={runSeconds}
                queryResult={queryResult}
              />
              <div style={{ height: '50%', display: 'flex' }}>
                <QueryResultDataTable
                  {...this.props}
                  isRunning={isRunning}
                  queryResult={queryResult}
                  queryError={queryError}
                />
              </div>
            </div>
          </div>
          <div style={{ display: visDisplay, width: '100%' }}>
            <div className='sidebar'>
              <div className='sidebar-body'>
                <FormGroup controlId='formControlsSelect' bsSize='small'>
                  <FormControl
                    value={query.chartConfiguration.chartType}
                    onChange={this.onChartTypeChange}
                    componentClass='select'
                    className='input-small'
                  >
                    <option value=''>Choose a chart type...</option>
                    {chartOptions}
                  </FormControl>
                </FormGroup>
                <ChartInputs
                  chartType={query.chartConfiguration.chartType}
                  queryChartConfigurationFields={
                    query.chartConfiguration.fields
                  }
                  onChartConfigurationFieldsChange={
                    this.onChartConfigurationFieldsChange
                  }
                  queryResult={queryResult}
                />
              </div>
              <div className='sidebar-actions-bottom'>
                <Button
                  onClick={this.onVisualizeClick}
                  disabled={!this.isChartable()}
                  className={'btn-block'}
                  bsSize={'sm'}
                >
                  Visualize
                </Button>
                <Button
                  onClick={this.onSaveImageClick}
                  className={'btn-block'}
                  bsSize={'sm'}
                >
                  <Glyphicon glyph='save' /> Save Chart Image
                </Button>
              </div>
            </div>
            <div className='flex-grow-1'>
              <SqlpadTauChart
                config={this.props.config}
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
