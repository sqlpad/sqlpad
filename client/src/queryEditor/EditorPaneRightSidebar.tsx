import React, { FunctionComponent, ReactElement } from 'react';
import SplitPane from 'react-split-pane';
import Spacer from '../common/Spacer';
import { debouncedResizeChart } from '../common/tauChartRef';
import { useSessionShowVisProperties } from '../stores/editor-store';
import ChartInputs from './ChartInputs';
import ChartStatementDisclaimer from './ChartStatementDisclaimer';
import ChartTypeSelect from './ChartTypeSelect';

interface EditorPaneRightSidebarProps {
  queryId: string;
  children: ReactElement;
}

const EditorPaneRightSidebar: FunctionComponent<EditorPaneRightSidebarProps> = ({
  children,
  queryId,
}: EditorPaneRightSidebarProps) => {
  const showVisProperties = useSessionShowVisProperties();

  let sidebarContent = null;

  if (showVisProperties) {
    sidebarContent = (
      <div style={{ position: 'absolute', padding: 8 }} className="h-100 w-100">
        <ChartStatementDisclaimer />
        <ChartTypeSelect />
        <Spacer size={2} />
        <ChartInputs />
      </div>
    );
  }

  if (!sidebarContent) {
    return children;
  }

  return (
    <SplitPane
      split="vertical"
      primary="second"
      defaultSize={260}
      maxSize={400}
      minSize={160}
      onChange={() => debouncedResizeChart(queryId)}
    >
      {children}
      {sidebarContent}
    </SplitPane>
  );
};

export default EditorPaneRightSidebar;
