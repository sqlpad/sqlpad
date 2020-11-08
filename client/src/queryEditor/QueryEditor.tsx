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
import DocumentTitle from './DocumentTitle';
import EditorPaneRightSidebar from './EditorPaneRightSidebar';
import EditorPaneSchemaSidebar from './EditorPaneSchemaSidebar';
import EditorPaneVis from './EditorPaneVis';
import QueryEditorResultPane from './QueryEditorResultPane';
import QueryEditorSqlEditor from './QueryEditorSqlEditor';
import Shortcuts from './Shortcuts';
import Toolbar from './Toolbar';
import UnsavedQuerySelector from './UnsavedQuerySelector';
import QuerySaveModal from './QuerySaveModal';
import queryString from 'query-string';
import { useParams } from 'react-router-dom';

interface ParsedQueryString {
  clone?: string;
}

interface Params {
  queryId?: string;
}

// TODO FIXME XXX - On 404 query not found, prompt user to start new or open existing query
// In both cases load new, but latter opens queries list

function QueryEditor() {
  const { queryId = '' } = useParams<Params>();

  const qs: ParsedQueryString = queryString.parse(window.location.search);
  const { clone } = qs;

  // Once initialized reset or load query on changes accordingly
  // When cloning, do not reset the editor state as it will be managed by the clone button
  // The clone could include changes made locally but not yet saved.
  // This feels confusing and I wonder if others are confused as well
  useEffect(() => {
    if (queryId === '' && !clone) {
      resetNewQuery();
      connectConnectionClient();
    } else if (queryId) {
      loadQuery(queryId).then(() => connectConnectionClient());
    }
  }, [queryId, clone]);

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
      <Shortcuts />
      <SchemaInfoLoader />
      <QuerySaveModal />
    </div>
  );
}

export default QueryEditor;
