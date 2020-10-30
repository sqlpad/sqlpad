import ChartIcon from 'mdi-react/ChartBarIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { toggleVisProperties } from '../../stores/editor-actions';

function ChartButton() {
  return (
    <IconButton
      tooltip="Configure visualization"
      onClick={() => toggleVisProperties()}
    >
      <ChartIcon />
    </IconButton>
  );
}

export default React.memo(ChartButton);
