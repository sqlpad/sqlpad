import PrivateIcon from 'mdi-react/AccountIcon';
import SharedIcon from 'mdi-react/AccountMultipleIcon';
import React from 'react';
import IconButton from '../../common/IconButton';
import { setQueryState } from '../../stores/editor-actions';
import { useEditorStore } from '../../stores/editor-store';

function ToolbarShareQueryButton() {
  const shared = useEditorStore((s) => {
    const acl = s?.query?.acl || [];
    return acl.length > 0;
  });

  function handleClick() {
    setQueryState(
      'acl',
      shared ? [] : [{ groupId: '__EVERYONE__', write: true }]
    );
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
