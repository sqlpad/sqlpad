import React, { FunctionComponent } from 'react';
import QueryResultDataTable from '../common/QueryResultContainer';
import { useEditorStore } from '../stores/editor-store';

const ConnectedQueryEditorResult: FunctionComponent = (props) => {
  const isRunning = useEditorStore((s) => s.isRunning);
  const queryResult = useEditorStore((s) => s.queryResult);
  const queryError = useEditorStore((s) => s.queryError);

  return (
    <QueryResultDataTable
      {...props}
      isRunning={isRunning}
      queryResult={queryResult}
      queryError={queryError}
    />
  );
};

export default ConnectedQueryEditorResult;
