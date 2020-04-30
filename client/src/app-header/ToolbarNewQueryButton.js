import React from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import { resetNewQuery } from '../stores/queries';

function mapStateToProps(state) {
  return {};
}

const ConnectedToolbarNewQueryButton = connect(mapStateToProps, (store) => ({
  resetNewQuery,
}))(React.memo(ToolbarNewQueryButton));

function ToolbarNewQueryButton({ resetNewQuery }) {
  return (
    <Button
      variant="ghost"
      to="/queries/new"
      tooltip="New query"
      onClick={() => resetNewQuery()}
    >
      New
    </Button>
  );
}

export default ConnectedToolbarNewQueryButton;
