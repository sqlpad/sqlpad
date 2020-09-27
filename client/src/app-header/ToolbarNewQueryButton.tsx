import React from 'react';
import Button from '../common/Button';
import { resetNewQuery } from '../stores/editor-actions';

function ToolbarNewQueryButton() {
  return (
    <Button
      variant="ghost"
      // TODO FIXME XXX: This was meant to be a buttonLink
      // to="/queries/new"
      tooltip="New query"
      onClick={() => resetNewQuery()}
    >
      New
    </Button>
  );
}

export default React.memo(ToolbarNewQueryButton);
