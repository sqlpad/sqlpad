import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import AppHeader from '../app-header/AppHeader';
import { debouncedResizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import { connectConnectionClient, loadQuery } from '../stores/editor-actions';
import useShortcuts from '../utilities/use-shortcuts';
import DocumentTitle from './DocumentTitle';
import EditorPaneRightSidebar from './EditorPaneRightSidebar';
import EditorPaneSchemaSidebar from './EditorPaneSchemaSidebar';
import EditorPaneVis from './EditorPaneVis';
import QueryEditorResultPane from './QueryEditorResultPane';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QuerySaveModal from './QuerySaveModal';
import Toolbar from './Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';

interface Params {
  queryId?: string;
}

// TODO FIXME XXX - On 404 query not found, prompt user to start new or open existing query
// In both cases load new, but latter opens queries list

function QueryEditor() {
  const { queryId = '' } = useParams<Params>();
  useShortcuts();

  // Once initialized reset or load query on changes accordingly
  useEffect(() => {
    if (queryId === '') {
      // Calling resetNewQuery is not necessary here as it will either be initialized that way on load,
      // or handled by the new query click in toolbar
      // We should however ensure the connection client is established if needed
      connectConnectionClient();
    } else if (queryId) {
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
        <EditorPaneRightSidebar queryId={queryId}>
          <EditorPaneSchemaSidebar queryId={queryId}>
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
          </EditorPaneSchemaSidebar>
        </EditorPaneRightSidebar>
      </div>
      <UnsavedQuerySelector queryId={queryId} />
      <DocumentTitle queryId={queryId} />
      <SchemaInfoLoader />
      <QuerySaveModal />
    </div>
  );
}

export default QueryEditor;
