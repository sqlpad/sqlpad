import React, { FunctionComponent, ReactElement, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import AppHeader from '../app-header/AppHeader';
import { debouncedResizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import SchemaSidebar from '../schema/SchemaSidebar';
import {
  connectConnectionClient,
  loadQuery,
  resetNewQuery,
} from '../stores/editor-actions';
import { useSessionShowSchema } from '../stores/editor-store';
import DocumentTitle from './DocumentTitle';
import EditorPaneVis from './EditorPaneVis';
import QueryEditorResultPane from './QueryEditorResultPane';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import Shortcuts from './Shortcuts';
import Toolbar from './toolbar/Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';

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

  return (
    <SplitPane
      split="vertical"
      minSize={150}
      defaultSize={280}
      maxSize={-100}
      onChange={() => debouncedResizeChart(queryId)}
    >
      <SchemaSidebar />
      {children}
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
            onChange={() => debouncedResizeChart(queryId)}
          >
            <EditorPaneVis queryId={queryId}>
              <QueryEditorSqlEditor />
            </EditorPaneVis>
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
