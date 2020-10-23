import CopyIcon from 'mdi-react/ContentCopyIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { handleCloneClick } from '../../stores/editor-actions';
import { useSessionQueryId } from '../../stores/editor-store';

function ToolbarCloneButton() {
  const queryId = useSessionQueryId();
  const cloneDisabled = !queryId;

  return (
    <IconButton
      tooltip="Clone"
      onClick={handleCloneClick}
      disabled={cloneDisabled}
    >
      <CopyIcon />
    </IconButton>
  );
}

export default React.memo(ToolbarCloneButton);
