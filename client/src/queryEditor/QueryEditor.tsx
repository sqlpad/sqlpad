import debounce from 'lodash/debounce';
import React, { useEffect, FunctionComponent, ReactElement } from 'react';
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
import QueryEditorResultPane from './QueryEditorResultPane';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import Shortcuts from './Shortcuts';
import Toolbar from './toolbar/Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';

const deboucedResearchChart = debounce(resizeChart, 700);

interface SchemaSidebarContainerProps {
  queryId: string;
  children: ReactElement;
}

const SchemaSidebarContainer: FunctionComponent<SchemaSidebarContainerProps> = ({
  children,
  queryId,
}: SchemaSidebarContainerProps) => {
  const showSchema = useSessionShowSchema();

  if (!showSchema) {
    return children;
  }

  function handleVisPaneResize() {
    deboucedResearchChart(queryId);
  }

  return (
    <SplitPane
      split="vertical"
      minSize={150}
      defaultSize={280}
      maxSize={-100}
      onChange={handleVisPaneResize}
    >
      <SchemaSidebar />
      {children}
    </SplitPane>
  );
};

interface VisContainerProps {
  queryId: string;
  children: ReactElement;
}

const VisContainer: FunctionComponent<VisContainerProps> = ({
  children,
  queryId,
}: VisContainerProps) => {
  const chartType = useSessionChartType();
  const showVis = Boolean(chartType);

  if (!showVis) {
    return children;
  }

  function handleVisPaneResize() {
    deboucedResearchChart(queryId);
  }

  return (
    <SplitPane
      key="editorAndVis"
      split="vertical"
      defaultSize={'50%'}
      maxSize={-200}
      onChange={handleVisPaneResize}
    >
      {children}
      <div style={{ position: 'absolute' }} className="h-100 w-100">
        <QueryEditorChartToolbar>
          <QueryEditorChart />
        </QueryEditorChartToolbar>
      </div>
    </SplitPane>
  );
};

type QueryEditorProps = {
  queryId: string;
};

function QueryEditor(props: QueryEditorProps) {
  const { queryId } = props;

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
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <SchemaSidebarContainer queryId={queryId}>
          <SplitPane
            split="horizontal"
            minSize={100}
            defaultSize={'60%'}
            maxSize={-100}
            onChange={handleVisPaneResize}
          >
            <VisContainer queryId={queryId}>
              <QueryEditorSqlEditor />
            </VisContainer>
            <QueryEditorResultPane />
          </SplitPane>
        </SchemaSidebarContainer>
      </div>
      <UnsavedQuerySelector queryId={queryId} />
      <DocumentTitle queryId={queryId} />
      <Shortcuts />
      <SchemaInfoLoader />
    </div>
  );
}

export default QueryEditor;
