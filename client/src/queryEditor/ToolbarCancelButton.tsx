import React from 'react';
import Button from '../common/Button';
import { connectConnectionClient, cancelQuery } from '../stores/editor-actions';
import {
  useExecutionStarting,
  useSessionAsyncDriver,
  useSessionIsRunning,
} from '../stores/editor-store';

function ToolbarCancelButton() {
  const isStarting = useExecutionStarting();
  const isAsynchronousDriver = useSessionAsyncDriver();
  const isRunning = useSessionIsRunning();

  if (isAsynchronousDriver) {
    return (
      <>
        <Button
          variant="primary"
          onClick={async () => {
            await connectConnectionClient();
            cancelQuery();
          }}
          disabled={!isStarting}
        >
          {(isRunning && !isStarting && 'Starting') || 'Cancel'}
        </Button>
      </>
    );
  } else {
    return <></>;
  }
}

export default React.memo(ToolbarCancelButton);
