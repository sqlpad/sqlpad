import React, { useCallback } from 'react';
import SqlEditor from '../common/SqlEditor';
import {
  handleQuerySelectionChange,
  setKernelQueryText,
} from '../stores/editor-actions';
import { useSessionQueryText } from '../stores/editor-store';

function QueryEditorSqlEditor() {
  const onChange = useCallback(
    (value: string) => setKernelQueryText(value),
    []
  );
  const value = useSessionQueryText();

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
