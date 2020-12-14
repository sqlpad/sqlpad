import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import AppHeader from '../app-header/AppHeader';
import { debouncedResizeChart } from '../common/tauChartRef';
import SchemaInfoLoader from '../schema/SchemaInfoLoader';
import {
  connectConnectionClient,
  loadKernelQuery,
  loadQuery,
} from '../stores/editor-actions';
import useShortcuts from '../utilities/use-shortcuts';
import DocumentTitle from './DocumentTitle';
import EditorPaneRightSidebar from './EditorPaneRightSidebar';
import EditorPaneSchemaSidebar from './EditorPaneSchemaSidebar';
import EditorPaneVis from './EditorPaneVis';
import NotFoundModal from './NotFoundModal';
import QueryEditorResultPane from './QueryEditorResultPane';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import QuerySaveModal from './QuerySaveModal';
import Toolbar from './Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';

interface Params {
  queryId?: string;
  entityData?: string;
}

function QueryEditor() {
  const [showNotFound, setShowNotFound] = useState(false);
  const { queryId = '', entityData = '' } = useParams<Params>();
  useShortcuts();

  // On queryId change from URL string, load query as needed.
  // If queryId does not exist, it is because the route is hitting `/queries/new` which avoids sending a queryId param
  // In the case of new query, the state is already set.
  // Either user landed here fresh (new query is set by default)
  // or they clicked new query button, which resets state on click.
  // Calling resetNewQuery here should not be necessary.
  // If query is not found, show the not found modal to inform user and prompt to start new query.
  useEffect(() => {
    setShowNotFound(false);
    if (entityData.length > 0) {
      loadKernelQuery(entityData).then(({ error, data }) => {
        if (error || !data) {
          return setShowNotFound(true);
        }
      });
    } else if (queryId === '') {
    }
    if (queryId.length > 0) {
      loadQuery(queryId).then(({ error, data }) => {
        if (error || !data) {
          return setShowNotFound(true);
        }
      });
    }

    connectConnectionClient();
  }, [queryId, entityData]);

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
      <NotFoundModal visible={showNotFound} queryId={queryId} />
    </div>
  );
}

export default QueryEditor;
