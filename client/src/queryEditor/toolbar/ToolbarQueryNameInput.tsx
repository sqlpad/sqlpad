import React from 'react';
import Input from '../../common/Input';
import { setQueryName } from '../../stores/editor-actions';
import { useQueryName, useShowValidation } from '../../stores/editor-store';

function ToolbarQueryNameInput() {
  const queryName = useQueryName();
  const showValidation = useShowValidation();
  const error = showValidation && !queryName.length;

  return (
    <Input
      error={error}
      style={{ width: 260 }}
      placeholder="Query name"
      value={queryName}
      onChange={(e: any) => setQueryName(e.target.value)}
    />
  );
}

export default React.memo(ToolbarQueryNameInput);
