import keymaster from 'keymaster';
import PropTypes from 'prop-types';
import React, { createRef } from 'react';
import SplitPane from 'react-split-pane';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import QueryEditorResult from './QueryEditorResult';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QueryEditorChart from './QueryEditorChart';
import EditorNavBar from './EditorNavBar';
import FlexTabPane from './FlexTabPane';
import QueryDetailsModal from './QueryDetailsModal';
import QueryResultHeader from './QueryResultHeader.js';
import SchemaSidebar from './SchemaSidebar.js';
import VisSidebar from './VisSidebar';

// TODO FIXME XXX capture unsaved state to local storage
// Prompt is removed. It doesn't always work anyways

class QueryEditor extends React.Component {
  componentDidUpdate(prevProps) {
    const { queryId, selectConnection, resetNewQuery, loadQuery } = this.props;
    if (queryId !== prevProps.queryId) {
      if (queryId === 'new') {
        return resetNewQuery();
      }
      return loadQuery(queryId, selectConnection);
    }
  }

  async componentDidMount() {
    const {
      queryId,
      loadConnections,
      selectConnection,
      selectedConnectionId,
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
      saveQuery(selectedConnectionId);
      return false;
    });
    keymaster('ctrl+return, command+return', e => {
      runQuery(selectedConnectionId);
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

  sqlpadTauChart = createRef(undefined);

  handleSaveImageClick = e => {
    if (this.sqlpadTauChart.current && this.sqlpadTauChart.current.exportPng) {
      this.sqlpadTauChart.current.exportPng();
    }
  };

  handleVisPaneResize = () => {
    if (this.sqlpadTauChart.current && this.sqlpadTauChart.current.resize) {
      this.sqlpadTauChart.current.resize();
    }
  };

  render() {
    console.log('rendering');
    const { activeTabKey, queryName } = this.props;

    document.title = queryName;

    return (
      <div className="flex w-100" style={{ flexDirection: 'column' }}>
        <EditorNavBar />
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <FlexTabPane tabKey="sql" activeTabKey={activeTabKey}>
            <SplitPane
              split="vertical"
              minSize={150}
              defaultSize={280}
              maxSize={-100}
            >
              <SchemaSidebar />
              <SplitPane
                split="horizontal"
                minSize={100}
                defaultSize={'60%'}
                maxSize={-100}
              >
                <QueryEditorSqlEditor />
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
              <VisSidebar onSaveImageClick={this.handleSaveImageClick} />
              <div className="flex-auto h-100">
                <QueryEditorChart ref={this.sqlpadTauChart} />
              </div>
            </SplitPane>
          </FlexTabPane>
        </div>
        <QueryDetailsModal />
      </div>
    );
  }
}

QueryEditor.propTypes = {
  activeTabKey: PropTypes.string.isRequired,
  connections: PropTypes.array.isRequired,
  formatQuery: PropTypes.func.isRequired,
  loadConnections: PropTypes.func.isRequired,
  loadQuery: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  queryId: PropTypes.string.isRequired,
  queryName: PropTypes.string,
  resetNewQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired,
  selectConnection: PropTypes.func,
  selectedConnectionId: PropTypes.string
};

QueryEditor.defaultProps = {
  queryName: 'New query'
};

function mapStateToProps(state, props) {
  return {
    activeTabKey: state.activeTabKey,
    queryName: state.query && state.query.name
  };
}

export default connect(
  mapStateToProps,
  actions
)(QueryEditor);
