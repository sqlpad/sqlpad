import { MenuItem } from '@reach/menu-button';
import CopyIcon from 'mdi-react/ContentCopyIcon';
import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import React, { CSSProperties, useState } from 'react';
import Button from '../common/Button';
import QueryConfirmModal from './QueryConfirmModal';
import {
  connectConnectionClient,
  formatQuery,
  handleCloneClick,
  runQuery,
  toggleShowQueryModal,
} from '../stores/editor-actions';
import {
  useSessionCanWrite,
  useSessionIsRunning,
  useSessionIsSaving,
  useSessionQueryId,
  useSessionUnsavedChanges,
} from '../stores/editor-store';

const menuItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

function ToolbarRunButton() {
  const isRunning = useSessionIsRunning();
  const queryId = useSessionQueryId();
  const isSaving = useSessionIsSaving();
  const canWrite = useSessionCanWrite();
  const unsavedChanges = useSessionUnsavedChanges();
  const cloneDisabled = !queryId;
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const saveIcon = unsavedChanges ? (
    <UnsavedIcon size={16} />
  ) : (
    <SaveIcon size={16} />
  );

  return (
    <>
      <Button
        variant="primary"
        onClick={async () => {
          await connectConnectionClient();
          setShowConfirmModal(true)
        }}
        disabled={isRunning}
        menuItems={[
          <MenuItem
            key="save"
            disabled={isSaving || !canWrite}
            onSelect={() => toggleShowQueryModal()}
            style={menuItemStyle}
          >
            {saveIcon}
            <div style={{ marginLeft: 4 }}>Save</div>
          </MenuItem>,
          <MenuItem
            key="format"
            onSelect={() => formatQuery()}
            style={menuItemStyle}
          >
            <FormatIcon size={16} />
            <div style={{ marginLeft: 4 }}>Format</div>
          </MenuItem>,
          <MenuItem
            key="clone"
            disabled={cloneDisabled}
            onSelect={() => handleCloneClick()}
            style={menuItemStyle}
          >
            <CopyIcon size={16} />
            <div style={{ marginLeft: 4 }}>Clone</div>
          </MenuItem>,
        ]}
      >
        Run
      </Button>
      <QueryConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {runQuery(); setShowConfirmModal(false)}}
      />
    </>
  );
}

export default React.memo(ToolbarRunButton);
