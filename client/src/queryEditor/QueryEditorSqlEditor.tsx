import React, { useCallback } from 'react';
import SqlEditor from '../common/SqlEditor';
import {
  handleQuerySelectionChange,
  setQueryState,
} from '../stores/editor-actions';
import { useEditorStore } from '../stores/editor-store';

function QueryEditorSqlEditor() {
  const onChange = useCallback(
    (value: string) => setQueryState('queryText', value),
    []
  );

  const value = useEditorStore((s) => s?.query?.queryText);

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
