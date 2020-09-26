import DatabaseIcon from 'mdi-react/DatabaseIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { toggleSchema } from '../../stores/queries-actions';

function ToolbarToggleSchemaButton() {
  return (
    <IconButton tooltip="Toggle schema" onClick={toggleSchema}>
      <DatabaseIcon />
    </IconButton>
  );
}

export default React.memo(ToolbarToggleSchemaButton);
