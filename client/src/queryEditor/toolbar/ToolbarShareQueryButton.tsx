import PrivateIcon from 'mdi-react/AccountIcon';
import SharedIcon from 'mdi-react/AccountMultipleIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { setAcl } from '../../stores/editor-actions';
import { useSessionQueryShared } from '../../stores/editor-store';

function ToolbarShareQueryButton() {
  const shared = useSessionQueryShared();

  function handleClick() {
    setAcl(shared ? [] : [{ groupId: '__EVERYONE__', write: true }]);
  }

  return (
    <IconButton
      tooltip={shared ? 'Query is shared' : 'Query is private'}
      onClick={handleClick}
    >
      {shared ? <SharedIcon /> : <PrivateIcon />}
    </IconButton>
  );
}

export default React.memo(ToolbarShareQueryButton);
