import React, { FunctionComponent, ReactElement } from 'react';
import SplitPane from 'react-split-pane';
import { debouncedResizeChart } from '../common/tauChartRef';
import { useSessionChartType } from '../stores/editor-store';
import QueryEditorChart from './QueryEditorChart';
import QueryEditorChartToolbar from './QueryEditorChartToolbar';

interface EditorPaneVisProps {
  queryId: string;
  children: ReactElement;
}

const EditorPaneVis: FunctionComponent<EditorPaneVisProps> = ({
  children,
  queryId,
}: EditorPaneVisProps) => {
  const chartType = useSessionChartType();
  const showVis = Boolean(chartType);

  if (!showVis) {
    return children;
  }

  return (
    <SplitPane
      key="editorAndVis"
      split="vertical"
      defaultSize={'50%'}
      maxSize={-200}
      onChange={() => debouncedResizeChart(queryId)}
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

export default EditorPaneVis;
