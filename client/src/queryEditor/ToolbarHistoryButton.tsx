import HistoryIcon from 'mdi-react/HistoryIcon';
import React, { useState } from 'react';
import IconButton from '../common/IconButton';
import HistoryDrawer from './HistoryDrawer';

function ToolbarHistoryButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <IconButton
        tooltip="View query run history"
        onClick={() => setShow(true)}
      >
        <HistoryIcon />
      </IconButton>
      {show && <HistoryDrawer visible={show} onClose={() => setShow(false)} />}
    </>
  );
}

export default React.memo(ToolbarHistoryButton);
