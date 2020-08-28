import React from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import { resetNewQuery } from '../stores/queries';

function mapStateToProps(state: any) {
  return {};
}

const ConnectedToolbarNewQueryButton = connect(mapStateToProps, (store) => ({
  resetNewQuery,
}))(React.memo(ToolbarNewQueryButton));

function ToolbarNewQueryButton({ resetNewQuery }: any) {
  return (
    <Button
      variant="ghost"
      // TODO FIXME XXX: This was meant to be a buttonLink
      // to="/queries/new"
      tooltip="New query"
      onClick={() => resetNewQuery()}
    >
      New
    </Button>
  );
}

export default ConnectedToolbarNewQueryButton;
