import NewIcon from 'mdi-react/PlusIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { resetNewQuery } from '../../stores/queries';

function mapStateToProps(state) {
  return {};
}

const ConnectedToolbarNewQueryButton = connect(mapStateToProps, store => ({
  resetNewQuery
}))(React.memo(ToolbarNewQueryButton));

function ToolbarNewQueryButton({ resetNewQuery }) {
  return (
    <IconButton
      to="/queries/new"
      tooltip="New query"
      onClick={() => resetNewQuery()}
    >
      <NewIcon />
    </IconButton>
  );
}

export default ConnectedToolbarNewQueryButton;
