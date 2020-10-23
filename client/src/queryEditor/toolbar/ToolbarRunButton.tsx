import React from 'react';
import Button from '../../common/Button';
import { connectConnectionClient, runQuery } from '../../stores/editor-actions';
import { useSessionIsRunning } from '../../stores/editor-store';

function ToolbarRunButton() {
  const isRunning = useSessionIsRunning();

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
