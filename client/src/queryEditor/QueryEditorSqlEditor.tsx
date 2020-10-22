import React, { useCallback } from 'react';
import SqlEditor from '../common/SqlEditor';
import {
  handleQuerySelectionChange,
  setQueryText,
} from '../stores/editor-actions';
import { useQueryText } from '../stores/editor-store';

function QueryEditorSqlEditor() {
  const onChange = useCallback((value: string) => setQueryText(value), []);
  const value = useQueryText();

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
