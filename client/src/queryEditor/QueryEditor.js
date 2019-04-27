import keymaster from 'keymaster';
import PropTypes from 'prop-types';
import React from 'react';
import SplitPane from 'react-split-pane';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import QueryEditorResult from './QueryEditorResult';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QueryEditorChart from './QueryEditorChart';
import Toolbar from './toolbar/Toolbar';

import QueryResultHeader from './QueryResultHeader.js';
import SchemaSidebar from '../schema/SchemaSidebar.js';
import VisSidebar from './VisSidebar';
import { resizeChart } from '../common/tauChartRef';

// TODO FIXME XXX capture unsaved state to local storage
// Prompt is removed. It doesn't always work anyways

class QueryEditor extends React.Component {
  componentDidUpdate(prevProps) {
    const { queryId, resetNewQuery, loadQuery } = this.props;
    if (queryId !== prevProps.queryId) {
      if (queryId === 'new') {
        return resetNewQuery();
      }
      return loadQuery(queryId);
    }
  }

  async componentDidMount() {
    const {
      queryId,
      loadConnections,
      loadTags,
      loadQuery,
      saveQuery,
      runQuery,
      formatQuery,
      resetNewQuery
    } = this.props;

    await Promise.all([loadConnections(), loadTags()]);
    if (queryId !== 'new') {
      await loadQuery(queryId);
    } else {
      // TODO FIXME XXX this won't reset query state from new to new
      resetNewQuery();
    }

    /*  Shortcuts
    ============================================================================== */
    // keymaster doesn't fire on input/textarea events by default
    // since we are only using command/ctrl shortcuts,
    // we want the event to fire all the time for any element
    keymaster.filter = () => true;
    keymaster('ctrl+s, command+s', e => {
      saveQuery();
      return false;
    });
    keymaster('ctrl+return, command+return', e => {
      runQuery();
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

  handleVisPaneResize = () => {
    const { queryId } = this.props;
    resizeChart(queryId);
  };

  render() {
    const {
      chartType,
      queryName,
      showSchema,
      showVisSidebar,
      queryId
    } = this.props;

    document.title = queryName;

    const editorAndVis = chartType ? (
      <SplitPane
        key="editorAndVis"
        split="vertical"
        defaultSize={'50%'}
        maxSize={-200}
        onChange={this.handleVisPaneResize}
      >
        <QueryEditorSqlEditor />
        <div style={{ padding: 16 }} className="flex-center h-100 w-100">
          <QueryEditorChart />
        </div>
      </SplitPane>
    ) : (
      <QueryEditorSqlEditor />
    );

    const editorResultPane = (
      <SplitPane
        split="horizontal"
        minSize={100}
        defaultSize={'60%'}
        maxSize={-100}
        onChange={this.handleVisPaneResize}
      >
        {editorAndVis}
        <div>
          <QueryResultHeader />
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
    );

    let sidebar = null;
    if (showSchema) {
      sidebar = <SchemaSidebar />;
    } else if (showVisSidebar) {
      sidebar = <VisSidebar queryId={queryId} />;
    }

    const sqlTabPane = sidebar ? (
      <SplitPane
        split="vertical"
        minSize={150}
        defaultSize={280}
        maxSize={-100}
        onChange={this.handleVisPaneResize}
      >
        {sidebar}
        {editorResultPane}
      </SplitPane>
    ) : (
      editorResultPane
    );

    return (
      <div
        style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <div style={{ position: 'relative', flexGrow: 1 }}>{sqlTabPane}</div>
      </div>
    );
  }
}

QueryEditor.propTypes = {
  formatQuery: PropTypes.func.isRequired,
  loadConnections: PropTypes.func.isRequired,
  loadQuery: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  queryId: PropTypes.string.isRequired,
  queryName: PropTypes.string,
  resetNewQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired
};

QueryEditor.defaultProps = {
  queryName: 'New query'
};

function mapStateToProps(state, props) {
  return {
    chartType:
      state.query &&
      state.query.chartConfiguration &&
      state.query.chartConfiguration.chartType,
    queryName: state.query && state.query.name,
    showSchema: state.showSchema,
    showVisSidebar: state.showVisSidebar
  };
}

export default connect(
  mapStateToProps,
  actions
)(QueryEditor);
