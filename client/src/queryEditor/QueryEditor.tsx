import debounce from 'lodash/debounce';
import React, { useEffect } from 'react';
import SplitPane from 'react-split-pane';
import AppHeader from '../app-header/AppHeader';
import { resizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import SchemaSidebar from '../schema/SchemaSidebar';
import {
  connectConnectionClient,
  loadQuery,
  resetNewQuery,
} from '../stores/editor-actions';
import {
  useSessionChartType,
  useSessionShowSchema,
} from '../stores/editor-store';
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
  queryId: string;
};

function QueryEditor(props: Props) {
  const { queryId } = props;
  const chartType = useSessionChartType();
  const showVis = Boolean(chartType);

  // Once initialized reset or load query on changes accordingly
  useEffect(() => {
    if (queryId === 'new') {
      resetNewQuery();
      connectConnectionClient();
    } else {
      loadQuery(queryId).then(() => connectConnectionClient());
    }
  }, [queryId]);

  function handleVisPaneResize() {
    deboucedResearchChart(queryId);
  }

  const showSchema = useSessionShowSchema();

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

export default QueryEditor;
