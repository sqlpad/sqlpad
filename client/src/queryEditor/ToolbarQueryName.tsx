import React from 'react';
import Button from '../common/Button';
import { toggleShowQueryModal } from '../stores/editor-actions';
import {
  useSessionCanWrite,
  useSessionQueryName,
  useSessionQueryShared,
  useSessionUnsavedChanges,
} from '../stores/editor-store';
import SharedIcon from 'mdi-react/AccountMultipleIcon';
import Tooltip from '../common/Tooltip';

// Shared icon is nudged a bit to align bottom of icon to text baseline
const sharedIconStyle = {
  marginLeft: 8,
  marginTop: 4,
};

function ToolbarQueryName() {
  const queryName = useSessionQueryName();
  const shared = useSessionQueryShared();
  const unsavedChanges = useSessionUnsavedChanges();
  const canWrite = useSessionCanWrite();

  let tooltipLabel = 'View query info';
  if (canWrite) {
    if (unsavedChanges) {
      tooltipLabel = `Edit and save query (unsaved changes)`;
    } else {
      tooltipLabel = `Edit and save query`;
    }
  }

  return (
    <Tooltip label={tooltipLabel}>
      <Button
        className="truncate"
        variant="primary-ghost"
        style={{ fontSize: 18 }}
        onClick={toggleShowQueryModal}
      >
        <div className="truncate" style={{ maxWidth: 500 }}>
          {queryName || 'New unsaved query'}
        </div>
        {unsavedChanges && canWrite && '*'}
        {shared && <SharedIcon size={18} style={sharedIconStyle} />}
      </Button>
    </Tooltip>
  );
}

export default React.memo(ToolbarQueryName);
