import React, { useEffect } from 'react';
import SplitPane from 'react-split-pane';
import AppHeader from '../app-header/AppHeader';
import { debouncedResizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import {
  connectConnectionClient,
  loadQuery,
  resetNewQuery,
} from '../stores/editor-actions';
import DocumentTitle from '../queryEditor/DocumentTitle';
import EditorPaneRightSidebar from '../queryEditor/EditorPaneRightSidebar';
import EditorPaneSchemaSidebar from '../queryEditor/EditorPaneSchemaSidebar';
import EditorPaneVis from '../queryEditor/EditorPaneVis';
import QueryEditorResultPane from '../queryEditor/QueryEditorResultPane';
import QueryEditorSqlEditor from '../queryEditor/QueryEditorSqlEditor';
import useShortcuts from '../utilities/use-shortcuts';
import Toolbar from '../queryEditor/Toolbar';
import UnsavedQuerySelector from '../queryEditor/UnsavedQuerySelector';
import QuerySaveModal from '../queryEditor/QuerySaveModal';
import { useParams } from 'react-router-dom';

interface Params {
  queryId?: string;
  sessionId: string;
}

// TODO FIXME XXX - On 404 query not found, prompt user to start new or open existing query
// In both cases load new, but latter opens queries list

function QueryEditor() {
  const { queryId = '', sessionId } = useParams<Params>();
  useShortcuts();

  // Once initialized reset or load query on changes accordingly
  useEffect(() => {
    if (queryId === '') {
      resetNewQuery(sessionId);
      connectConnectionClient();
    } else if (queryId) {
      loadQuery(queryId, sessionId).then(() => connectConnectionClient());
    }
  }, [queryId, sessionId]);

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
