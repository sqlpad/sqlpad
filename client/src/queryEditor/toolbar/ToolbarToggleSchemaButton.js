import DatabaseIcon from 'mdi-react/DatabaseIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { useSchemaState } from '../../stores/schema-context';

function ToolbarToggleSchemaButton() {
  const { toggleSchema } = useSchemaState();

  return (
    <IconButton tooltip="Toggle schema" onClick={toggleSchema}>
      <DatabaseIcon />
    </IconButton>
  );
}

export default React.memo(ToolbarToggleSchemaButton);
