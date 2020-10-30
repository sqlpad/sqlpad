import React, { FunctionComponent, ReactElement } from 'react';
import SplitPane from 'react-split-pane';
import { debouncedResizeChart } from '../common/tauChartRef';
import SchemaSidebar from '../schema/SchemaSidebar';
import { useSessionShowSchema } from '../stores/editor-store';

interface EditorPaneSchemaSidebarProps {
  queryId: string;
  children: ReactElement;
}

const EditorPaneSchemaSidebar: FunctionComponent<EditorPaneSchemaSidebarProps> = ({
  children,
  queryId,
}: EditorPaneSchemaSidebarProps) => {
  const showSchema = useSessionShowSchema();

  if (!showSchema) {
    return children;
  }

  return (
    <SplitPane
      split="vertical"
      minSize={150}
      defaultSize={260}
      maxSize={-100}
      onChange={() => debouncedResizeChart(queryId)}
    >
      <SchemaSidebar />
      {children}
    </SplitPane>
  );
};

export default EditorPaneSchemaSidebar;
