import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { formatQuery } from '../../stores/editor-actions';

function ToolbarFormatQueryButton() {
  return (
    <IconButton tooltip="Format" onClick={formatQuery}>
      <FormatIcon />
    </IconButton>
  );
}

export default React.memo(ToolbarFormatQueryButton);
