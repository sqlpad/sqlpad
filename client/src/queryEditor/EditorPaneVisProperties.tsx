import React, { FunctionComponent, ReactElement } from 'react';
import SplitPane from 'react-split-pane';
import Spacer from '../common/Spacer';
import { debouncedResizeChart } from '../common/tauChartRef';
import { useSessionShowVisProperties } from '../stores/editor-store';
import ChartInputs from './ChartInputs';
import ChartTypeSelect from './ChartTypeSelect';

interface EditorPaneVisPropertiesProps {
  queryId: string;
  children: ReactElement;
}

const EditorPaneVisProperties: FunctionComponent<EditorPaneVisPropertiesProps> = ({
  children,
  queryId,
}: EditorPaneVisPropertiesProps) => {
  const showVisProperties = useSessionShowVisProperties();

  if (!showVisProperties) {
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
      <div style={{ position: 'absolute', padding: 8 }} className="h-100 w-100">
        <ChartTypeSelect />
        <Spacer size={2} />
        <ChartInputs />
      </div>
    </SplitPane>
  );
};

export default EditorPaneVisProperties;
