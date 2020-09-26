import React, { useCallback } from 'react';
import SqlEditor from '../common/SqlEditor';
import {
  handleQuerySelectionChange,
  setQueryState,
} from '../stores/queries-actions';
import { useQueriesStore } from '../stores/queries-store';

function QueryEditorSqlEditor() {
  const onChange = useCallback(
    (value: string) => setQueryState('queryText', value),
    []
  );

  const value = useQueriesStore((s) => s?.query?.queryText);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <SqlEditor
        value={value || ''}
        onChange={onChange}
        onSelectionChange={handleQuerySelectionChange}
      />
    </div>
  );
}

export default QueryEditorSqlEditor;
