import PrivateIcon from 'mdi-react/AccountIcon';
import SharedIcon from 'mdi-react/AccountMultipleIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { setQueryState } from '../../stores/queries';

function mapStateToProps(state: any) {
  const acl = state.query.acl || [];
  return {
    shared: acl.length > 0,
  };
}

const ConnectedToolbarShareQueryButton = connect(mapStateToProps, (store) => ({
  setQueryState,
}))(React.memo(ToolbarShareQueryButton));

function ToolbarShareQueryButton({ shared, setQueryState }: any) {
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

export default ConnectedToolbarShareQueryButton;
