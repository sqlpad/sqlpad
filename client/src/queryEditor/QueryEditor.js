import keymaster from 'keymaster';
import PropTypes from 'prop-types';
import React, { createRef } from 'react';
import SplitPane from 'react-split-pane';
import { connect } from 'unistore/react';

import { actions } from '../stores/unistoreStore';
import QueryEditorResult from './QueryEditorResult';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import SqlpadTauChart from '../common/SqlpadTauChart.js';
import EditorNavBar from './EditorNavBar';
import FlexTabPane from './FlexTabPane';
import QueryDetailsModal from './QueryDetailsModal';
import QueryResultHeader from './QueryResultHeader.js';
import SchemaSidebar from './SchemaSidebar.js';
import VisSidebar from './VisSidebar';

// TODO FIXME XXX capture unsaved state to local storage
// Prompt is removed. It doesn't always work anyways

class QueryEditor extends React.Component {
  sqlpadTauChart = createRef(undefined);

  getTagOptions() {
    const { availableTags, query } = this.props;
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
    const { queryId, selectConnection, resetNewQuery, loadQuery } = this.props;
    if (queryId !== prevProps.queryId) {
      if (queryId === 'new') {
        return resetNewQuery();
      }
      return loadQuery(queryId, selectConnection);
    }
  }

  handleConnectionChange = connectionId =>
    this.props.selectConnection(connectionId);

  handleQueryNameChange = name => {
    this.props.setQueryState('name', name);
  };

  handleQueryTagsChange = values => {
    this.props.setQueryState('tags', values);
  };

  handleSaveImageClick = e => {
    if (this.sqlpadTauChart.current && this.sqlpadTauChart.current.exportPng) {
      this.sqlpadTauChart.current.exportPng();
    }
  };

  async componentDidMount() {
    const {
      queryId,
      loadConnections,
      selectConnection,
      loadTags,
      loadQuery,
      saveQuery,
      runQuery,
      formatQuery
    } = this.props;

    await Promise.all([loadConnections(), loadTags()]);
    if (queryId !== 'new') {
      await loadQuery(queryId, selectConnection);
    }

    /*  Shortcuts
    ============================================================================== */
    // keymaster doesn't fire on input/textarea events by default
    // since we are only using command/ctrl shortcuts,
    // we want the event to fire all the time for any element
    keymaster.filter = () => true;
    keymaster('ctrl+s, command+s', e => {
      saveQuery(this.props.config, this.props.selectedConnectionId);
      return false;
    });
    keymaster('ctrl+return, command+return', e => {
      runQuery(this.props.selectedConnectionId);
      return false;
    });
    keymaster('shift+return', e => {
      formatQuery();
      return false;
    });
  }

  componentWillUnmount() {
    keymaster.unbind('ctrl+return, command+return');
    keymaster.unbind('ctrl+s, command+s');
    keymaster.unbind('shift+return');
  }

  handleFormatClick = () => {
    this.props.formatQuery();
  };

  handleCloneClick = () => {
    this.props.handleCloneClick(this.props.config);
  };

  handleVisPaneResize = () => {
    if (this.sqlpadTauChart.current && this.sqlpadTauChart.current.resize) {
      this.sqlpadTauChart.current.resize();
    }
  };

  runQuery = () => {
    this.props.runQuery(this.props.selectedConnectionId);
  };

  saveQuery = () => {
    const { saveQuery, config, selectedConnectionId } = this.props;
    saveQuery(config, selectedConnectionId);
  };

  render() {
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
    } = this.props;

    document.title = query.name || 'New Query';

    return (
      <div className="flex w-100" style={{ flexDirection: 'column' }}>
        <EditorNavBar
          activeTabKey={activeTabKey}
          isRunning={isRunning}
          isSaving={isSaving}
          onCloneClick={this.handleCloneClick}
          onMoreClick={this.props.handleMoreClick}
          onRunClick={this.runQuery}
          onSaveClick={this.saveQuery}
          onFormatClick={this.handleFormatClick}
          onTabSelect={this.props.handleTabSelect}
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
                <QueryEditorSqlEditor />
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
                    <QueryEditorResult />
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
                onChartConfigurationFieldsChange={
                  this.props.handleChartConfigurationFieldsChange
                }
                onChartTypeChange={this.props.handleChartTypeChange}
                onSaveImageClick={this.handleSaveImageClick}
                query={query}
                queryResult={queryResult}
              />
              <div className="flex-auto h-100">
                <SqlpadTauChart
                  isRunning={isRunning}
                  query={query}
                  queryError={queryError}
                  queryResult={queryResult}
                  ref={this.sqlpadTauChart}
                  isVisible={activeTabKey === 'vis'}
                />
              </div>
            </SplitPane>
          </FlexTabPane>
        </div>
        <QueryDetailsModal
          onHide={this.props.handleModalHide}
          onQueryTagsChange={this.handleQueryTagsChange}
          query={query}
          showModal={showModal}
          tagOptions={this.getTagOptions()}
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

const ConnectedQueryEditor = connect(
  [
    'activeTabKey',
    'availableTags',
    'cacheKey',
    'isRunning',
    'isSaving',
    'query',
    'queryError',
    'queryResult',
    'runQueryStartTime',
    'runSeconds',
    'showModal',
    'showValidation',
    'unsavedChanges'
  ],
  actions
)(QueryEditor);

export default ConnectedQueryEditor;
