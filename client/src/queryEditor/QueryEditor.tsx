import debounce from 'lodash/debounce';
import React, { useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { connect } from 'unistore/react';
import AppHeader from '../app-header/AppHeader';
import { resizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import SchemaSidebar from '../schema/SchemaSidebar';
import { connectConnectionClient } from '../stores/connections';
import { loadQuery, resetNewQuery } from '../stores/queries';
import useSchemaState from '../stores/use-schema-state';
import DocumentTitle from './DocumentTitle';
import QueryEditorChart from './QueryEditorChart';
import QueryEditorChartToolbar from './QueryEditorChartToolbar';
import QueryEditorResult from './QueryEditorResult';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QueryResultHeader from './QueryResultHeader';
import Shortcuts from './Shortcuts';
import Toolbar from './toolbar/Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';

const deboucedResearchChart = debounce(resizeChart, 700);

type Props = {
  loadQuery: (...args: any[]) => any;
  queryId: string;
  resetNewQuery: (...args: any[]) => any;
  showVis?: boolean;
};

function QueryEditor(props: Props) {
  const {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'connectConnectionClient' does not exist ... Remove this comment to see the full error message
    connectConnectionClient,
    loadQuery,
    queryId,
    resetNewQuery,
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

  const { showSchema } = useSchemaState();

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

function mapStateToProps(state: any, props: any) {
  const showVis =
    state.query && state.query.chart && Boolean(state.query.chart.chartType);

  return {
    showVis,
  };
}

export default connect(mapStateToProps, (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  loadQuery,
  resetNewQuery,
}))(QueryEditor);
