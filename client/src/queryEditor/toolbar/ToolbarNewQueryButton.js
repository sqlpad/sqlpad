import NewIcon from 'mdi-react/PlusIcon';
import React from 'react';
import { connect } from 'unistore/react';
import AppHeaderIconButton from '../../common/AppHeaderIconButton';
import { resetNewQuery } from '../../stores/queries';

function mapStateToProps(state) {
  return {};
}

const ConnectedToolbarNewQueryButton = connect(mapStateToProps, store => ({
  resetNewQuery
}))(React.memo(ToolbarNewQueryButton));

function ToolbarNewQueryButton({ resetNewQuery }) {
  return (
    <AppHeaderIconButton
      to="/queries/new"
      tooltip="New query"
      onClick={() => resetNewQuery()}
    >
      <NewIcon />
    </AppHeaderIconButton>
  );
}

export default ConnectedToolbarNewQueryButton;
