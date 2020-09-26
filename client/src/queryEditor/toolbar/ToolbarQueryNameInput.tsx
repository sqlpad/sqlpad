import React from 'react';
import Input from '../../common/Input';
import { setQueryState } from '../../stores/editor-actions';
import { useEditorStore } from '../../stores/editor-store';

function ToolbarQueryNameInput() {
  const queryName = useEditorStore((s) => s?.query?.name);
  const showValidation = useEditorStore((s) => s.showValidation);
  const error = showValidation && !queryName.length;

  return (
    <Input
      error={error}
      style={{ width: 260 }}
      placeholder="Query name"
      value={queryName}
      onChange={(e: any) => setQueryState('name', e.target.value)}
    />
  );
}

export default React.memo(ToolbarQueryNameInput);
