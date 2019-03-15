import message from 'antd/lib/message';
import keymaster from 'keymaster';
import PropTypes from 'prop-types';
import React from 'react';
import { Prompt } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import sqlFormatter from 'sql-formatter';
import uuid from 'uuid';
import QueryResultDataTable from '../common/QueryResultDataTable.js';
import SqlEditor from '../common/SqlEditor';
import SqlpadTauChart from '../common/SqlpadTauChart.js';
import fetchJson from '../utilities/fetch-json.js';
import EditorNavBar from './EditorNavBar';
import FlexTabPane from './FlexTabPane';
import QueryDetailsModal from './QueryDetailsModal';
import QueryResultHeader from './QueryResultHeader.js';
import SchemaSidebar from './SchemaSidebar.js';
import VisSidebar from './VisSidebar';

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
};

class QueryEditor extends React.Component {
  state = {
    activeTabKey: 'sql',
    availableTags: [],
    cacheKey: uuid.v1(),
    isRunning: false,
    isSaving: false,
    unsavedChanges: false,
    query: Object.assign({}, NEW_QUERY),
    queryResult: undefined,
    runQueryStartTime: undefined,
    showModal: false,
    showValidation: false,
    selectedText: ''
  };

  sqlpadTauChart = undefined;

  getTagOptions() {
    const { availableTags, query } = this.state;
    const tagOptions = availableTags.slice();
    if (query && query.tags) {
      query.tags.forEach(t => {
        if (tagOptions.indexOf(t) === -1) {
          tagOptions.push(t);
        }
      });
    }
    return tagOptions;
  }

  componentDidUpdate(prevProps) {
    const { queryId } = this.props;

    if (queryId !== prevProps.queryId) {
      if (queryId === 'new') {
        return this.setState({
          activeTabKey: 'sql',
          queryResult: undefined,
          query: Object.assign({}, NEW_QUERY),
          unsavedChanges: false
        });
      }
      return this.loadQueryFromServer(queryId);
    }
  }

  loadQueryFromServer = queryId => {
    const { selectConnection } = this.props;
    fetchJson('GET', `/api/queries/${queryId}`).then(json => {
      const { error, query } = json;
      if (error) {
        message.error(error);
      }
      this.setState({ query });
      selectConnection(query.connectionId);
    });
  };

  loadTagsFromServer = () => {
    fetchJson('GET', '/api/tags').then(json => {
      const { error, tags } = json;
      if (error) {
        message.error(error);
      }
      this.setState({ availableTags: tags });
    });
  };

  runQuery = () => {
    const { cacheKey, query, selectedText } = this.state;
    const { selectedConnectionId } = this.props;

    this.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    });
    const postData = {
      connectionId: selectedConnectionId,
      cacheKey,
      queryName: query.name,
      queryText: selectedText || query.queryText
    };
    fetchJson('POST', '/api/query-result', postData).then(json => {
      if (json.error) message.error(json.error);
      this.setState({
        isRunning: false,
        queryError: json.error,
        queryResult: json.queryResult
      });
    });
  };

  handleCloneClick = () => {
    const { config } = this.props;
    const { query } = this.state;
    delete query._id;
    query.name = 'Copy of ' + query.name;
    window.history.replaceState(
      {},
      query.name,
      `${config.baseUrl}/queries/new`
    );
    this.setState({ query, unsavedChanges: true });
  };

  formatQuery = () => {
    const { query } = this.state;
    query.queryText = sqlFormatter.format(query.queryText);
    this.setState({
      query,
      unsavedChanges: true
    });
  };

  saveQuery = () => {
    const { query } = this.state;
    const { config, selectedConnectionId } = this.props;
    if (!query.name) {
      message.error('Query name required');
      this.setState({ showValidation: true });
      return;
    }
    this.setState({ isSaving: true });
    const queryData = Object.assign({}, query, {
      connectionId: selectedConnectionId
    });
    if (query._id) {
      fetchJson('PUT', `/api/queries/${query._id}`, queryData).then(json => {
        const { error, query } = json;
        if (error) {
          message.error(error);
          this.setState({ isSaving: false });
          return;
        }
        message.success('Query Saved');
        this.setState({ isSaving: false, unsavedChanges: false, query });
      });
    } else {
      fetchJson('POST', `/api/queries`, queryData).then(json => {
        const { error, query } = json;
        if (error) {
          message.error(error);
          this.setState({ isSaving: false });
          return;
        }
        window.history.replaceState(
          {},
          query.name,
          `${config.baseUrl}/queries/${query._id}`
        );
        message.success('Query Saved');
        this.setState({ isSaving: false, unsavedChanges: false, query });
      });
    }
  };

  setQueryState = (field, value) => {
    const { query } = this.state;
    query[field] = value;
    this.setState({ query, unsavedChanges: true });
  };

  handleChartConfigurationFieldsChange = (chartFieldId, queryResultField) => {
    const { query } = this.state;
    query.chartConfiguration.fields[chartFieldId] = queryResultField;
    this.setState({ query, unsavedChanges: true });
  };

  handleChartTypeChange = value => {
    const { query } = this.state;
    query.chartConfiguration.chartType = value;
    this.setState({ query, unsavedChanges: true });
  };

  handleConnectionChange = connectionId =>
    this.props.selectConnection(connectionId);

  handleModalHide = () => {
    this.setState({ showModal: false });
  };

  handleQueryNameChange = name => this.setQueryState('name', name);

  handleMoreClick = () => this.setState({ showModal: true });

  handleQueryTagsChange = values => this.setQueryState('tags', values);

  handleQueryTextChange = queryText =>
    this.setQueryState('queryText', queryText);

  handleQuerySelectionChange = selectedText => {
    this.setState({ selectedText });
  };

  handleSaveImageClick = e => {
    if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
      this.sqlpadTauChart.chart.fire('exportTo', 'png');
    }
  };

  handleTabSelect = e => {
    this.setState({ activeTabKey: e.target.value });
  };

  handleVisualizeClick = () => this.sqlpadTauChart.renderChart(true);

  hasRows = () => {
    const queryResult = this.state.queryResult;
    return !!(queryResult && queryResult.rows && queryResult.rows.length);
  };

  isChartable = () => {
    const { isRunning, queryError, activeTabKey } = this.state;
    const pending = isRunning || queryError;
    return !pending && activeTabKey === 'vis' && this.hasRows();
  };

  async componentDidMount() {
    const { queryId, loadConnections } = this.props;

    await loadConnections();
    this.loadTagsFromServer();
    if (queryId !== 'new') {
      this.loadQueryFromServer(queryId);
    }

    /*  Shortcuts
    ============================================================================== */
    // keymaster doesn't fire on input/textarea events by default
    // since we are only using command/ctrl shortcuts,
    // we want the event to fire all the time for any element
    keymaster.filter = () => true;
    keymaster.unbind('ctrl+s, command+s');
    keymaster('ctrl+s, command+s', e => {
      this.saveQuery();
      e.preventDefault();
      return false;
    });
    // there should only ever be 1 QueryEditor on the page,
    // but just in case there isn't unbind anything previously bound
    // rather something previously not run than something run more than once
    keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e');
    keymaster('ctrl+r, command+r, ctrl+e, command+e', e => {
      message.info('Shortcut changed to ctrl+return / command+return');
      e.preventDefault();
      return false;
    });
    keymaster.unbind('ctrl+return, command+return');
    keymaster('ctrl+return, command+return', e => {
      this.runQuery();
      e.preventDefault();
      return false;
    });
    keymaster.unbind('alt+r');
    keymaster('alt+r', e => {
      message.info('Shortcut changed to shift+return');
      e.preventDefault();
      return false;
    });
    keymaster.unbind('shift+return');
    keymaster('shift+return', e => {
      this.formatQuery();
      e.preventDefault();
      return false;
    });
  }

  componentWillUnmount() {
    keymaster.unbind('ctrl+return, command+return');
    keymaster.unbind('ctrl+s, command+s');
    keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e');
    keymaster.unbind('alt+r');
    keymaster.unbind('shift+return');
  }

  handleFormatClick = () => {
    this.formatQuery();
  };

  handleVisPaneResize = () => {
    if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
      this.sqlpadTauChart.chart.resize();
    }
  };

  render() {
    const { config } = this.props;
    const {
      activeTabKey,
      cacheKey,
      isRunning,
      isSaving,
      query,
      queryError,
      queryResult,
      runQueryStartTime,
      runSeconds,
      showModal,
      showValidation,
      unsavedChanges
    } = this.state;

    document.title = query.name || 'New Query';

    return (
      <div className="flex w-100" style={{ flexDirection: 'column' }}>
        <EditorNavBar
          activeTabKey={activeTabKey}
          isRunning={isRunning}
          isSaving={isSaving}
          onCloneClick={this.handleCloneClick}
          onMoreClick={this.handleMoreClick}
          onRunClick={this.runQuery}
          onSaveClick={this.saveQuery}
          onFormatClick={this.handleFormatClick}
          onTabSelect={this.handleTabSelect}
          query={query}
          onQueryNameChange={this.handleQueryNameChange}
          showValidation={showValidation}
          unsavedChanges={unsavedChanges}
        />
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <FlexTabPane tabKey="sql" activeTabKey={activeTabKey}>
            <SplitPane
              split="vertical"
              minSize={150}
              defaultSize={280}
              maxSize={-100}
            >
              <SchemaSidebar {...this.props} />
              <SplitPane
                split="horizontal"
                minSize={100}
                defaultSize={'60%'}
                maxSize={-100}
              >
                <SqlEditor
                  config={config}
                  value={query.queryText}
                  onChange={this.handleQueryTextChange}
                  onSelectionChange={this.handleQuerySelectionChange}
                />
                <div>
                  <QueryResultHeader
                    {...this.props}
                    cacheKey={cacheKey}
                    isRunning={isRunning}
                    queryResult={queryResult}
                    runQueryStartTime={runQueryStartTime}
                    runSeconds={runSeconds}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 30,
                      bottom: 0,
                      left: 0,
                      right: 0
                    }}
                  >
                    <QueryResultDataTable
                      {...this.props}
                      isRunning={isRunning}
                      queryError={queryError}
                      queryResult={queryResult}
                    />
                  </div>
                </div>
              </SplitPane>
            </SplitPane>
          </FlexTabPane>
          <FlexTabPane tabKey="vis" activeTabKey={activeTabKey}>
            <SplitPane
              split="vertical"
              minSize={150}
              defaultSize={280}
              maxSize={-100}
              onChange={this.handleVisPaneResize}
            >
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
              <div className="flex-auto h-100">
                <SqlpadTauChart
                  config={this.props.config}
                  isRunning={isRunning}
                  query={query}
                  queryError={queryError}
                  queryResult={queryResult}
                  renderChart={this.isChartable()}
                  ref={ref => {
                    this.sqlpadTauChart = ref;
                  }}
                />
              </div>
            </SplitPane>
          </FlexTabPane>
        </div>
        <QueryDetailsModal
          config={config}
          onHide={this.handleModalHide}
          onQueryTagsChange={this.handleQueryTagsChange}
          query={query}
          showModal={showModal}
          tagOptions={this.getTagOptions()}
        />
        <Prompt
          when={unsavedChanges}
          message={location => `Leave without saving?`}
        />
      </div>
    );
  }
}

QueryEditor.propTypes = {
  connections: PropTypes.array.isRequired,
  selectedConnectionId: PropTypes.string,
  selectConnection: PropTypes.func,
  loadConnections: PropTypes.func
};

export default QueryEditor;
