import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { saveQuery } from '../../stores/queries-actions';
import { useQueriesStore } from '../../stores/queries-store';

function ToolbarSaveButton() {
  const isSaving = useQueriesStore((s) => s.isSaving);
  const unsavedChanges = useQueriesStore((s) => s.unsavedChanges);

  return (
    <IconButton tooltip="Save" onClick={() => saveQuery()} disabled={isSaving}>
      {unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
    </IconButton>
  );
}

export default React.memo(ToolbarSaveButton);
