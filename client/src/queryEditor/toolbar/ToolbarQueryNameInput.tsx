import React from 'react';
import Input from '../../common/Input';
import { setQueryState } from '../../stores/queries-actions';
import { useQueriesStore } from '../../stores/queries-store';

function ToolbarQueryNameInput() {
  const queryName = useQueriesStore((s) => s?.query?.name);
  const showValidation = useQueriesStore((s) => s.showValidation);
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
