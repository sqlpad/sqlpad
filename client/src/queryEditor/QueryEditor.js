import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { connect } from 'unistore/react';
import AppHeader from '../app-header/AppHeader';
import { resizeChart } from '../common/tauChartRef';
import SchemaSidebar from '../schema/SchemaSidebar.js';
import { connectConnectionClient } from '../stores/connections';
import { loadQuery, resetNewQuery } from '../stores/queries';
import DocumentTitle from './DocumentTitle';
import QueryEditorChart from './QueryEditorChart';
import QueryEditorChartToolbar from './QueryEditorChartToolbar';
import QueryEditorResult from './QueryEditorResult';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QueryResultHeader from './QueryResultHeader.js';
import Shortcuts from './Shortcuts';
import Toolbar from './toolbar/Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';

const deboucedResearchChart = debounce(resizeChart, 700);

function QueryEditor(props) {
  const {
    connectConnectionClient,
    loadQuery,
    queryId,
    resetNewQuery,
    showSchema,
    showVis,
  } = props;

  // Once initialized reset or load query on changes accordingly
  useEffect(() => {
    if (queryId === 'new') {
      resetNewQuery();
      connectConnectionClient();
    } else {
      loadQuery(queryId).then(() => connectConnectionClient());
    }
  }, [connectConnectionClient, queryId, resetNewQuery, loadQuery]);

  function handleVisPaneResize() {
    deboucedResearchChart(queryId);
  }

  const editorAndVis = showVis ? (
    <SplitPane
      key="editorAndVis"
      split="vertical"
      defaultSize={'50%'}
      maxSize={-200}
      onChange={handleVisPaneResize}
    >
      <QueryEditorSqlEditor />
      <div style={{ position: 'absolute' }} className="h-100 w-100">
        <QueryEditorChartToolbar>
          <QueryEditorChart />
        </QueryEditorChartToolbar>
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
      onChange={handleVisPaneResize}
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
            right: 0,
          }}
        >
          <QueryEditorResult />
        </div>
      </div>
    </SplitPane>
  );

  const sqlTabPane = showSchema ? (
    <SplitPane
      split="vertical"
      minSize={150}
      defaultSize={280}
      maxSize={-100}
      onChange={handleVisPaneResize}
    >
      <SchemaSidebar />
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
        flexDirection: 'column',
      }}
    >
      <AppHeader />
      <Toolbar />
      <div style={{ position: 'relative', flexGrow: 1 }}>{sqlTabPane}</div>
      <UnsavedQuerySelector queryId={queryId} />
      <DocumentTitle queryId={queryId} />
      <Shortcuts />
      <SchemaInfoLoader />
    </div>
  );
}

QueryEditor.propTypes = {
  loadQuery: PropTypes.func.isRequired,
  queryId: PropTypes.string.isRequired,
  resetNewQuery: PropTypes.func.isRequired,
  showSchema: PropTypes.bool,
  showVis: PropTypes.bool,
};

function mapStateToProps(state, props) {
  const showVis =
    state.query && state.query.chart && Boolean(state.query.chart.chartType);

  return {
    showVis,
    showSchema: state.showSchema,
  };
}

export default connect(mapStateToProps, (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  loadQuery,
  resetNewQuery,
}))(QueryEditor);
