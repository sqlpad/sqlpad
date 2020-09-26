import React from 'react';
import Button from '../../common/Button';
import { connectConnectionClient } from '../../stores/queries-actions';
import { runQuery } from '../../stores/queries-actions';
import { useQueriesStore } from '../../stores/queries-store';

function ToolbarRunButton() {
  const isRunning = useQueriesStore((s) => s.isRunning);

  return (
    <Button
      variant="primary"
      onClick={async () => {
        await connectConnectionClient();
        runQuery();
      }}
      disabled={isRunning}
    >
      Run
    </Button>
  );
}

export default React.memo(ToolbarRunButton);
