import CopyIcon from 'mdi-react/ContentCopyIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { handleCloneClick } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    queryId: state.query && state.query.id,
  };
}

const ConnectedToolbarCloneButton = connect(mapStateToProps, (store) => ({
  handleCloneClick,
}))(React.memo(ToolbarCloneButton));

function ToolbarCloneButton({ handleCloneClick, queryId }) {
  const cloneDisabled = !queryId;

  return (
    <IconButton
      tooltip="Clone"
      onClick={handleCloneClick}
      disabled={cloneDisabled}
    >
      <CopyIcon />
    </IconButton>
  );
}

export default ConnectedToolbarCloneButton;
