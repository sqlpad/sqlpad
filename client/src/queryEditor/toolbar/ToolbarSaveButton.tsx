import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { saveQuery } from '../../stores/editor-actions';
import { useIsSaving, useUnsavedChanges } from '../../stores/editor-store';

function ToolbarSaveButton() {
  const isSaving = useIsSaving();
  const unsavedChanges = useUnsavedChanges();

  return (
    <IconButton tooltip="Save" onClick={() => saveQuery()} disabled={isSaving}>
      {unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
    </IconButton>
  );
}

export default React.memo(ToolbarSaveButton);
