import debounce from 'lodash/debounce';
import React, { FunctionComponent, ReactElement } from 'react';
import SplitPane from 'react-split-pane';
import { resizeChart } from '../common/tauChartRef';
import { useSessionChartType } from '../stores/editor-store';
import QueryEditorChart from './QueryEditorChart';
import QueryEditorChartToolbar from './QueryEditorChartToolbar';

const deboucedResearchChart = debounce(resizeChart, 700);

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

export default EditorPaneVis;
