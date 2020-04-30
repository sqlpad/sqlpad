import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { saveQuery } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    isSaving: state.isSaving,
    unsavedChanges: state.unsavedChanges,
  };
}

const ConnectedToolbarSaveButton = connect(mapStateToProps, (store) => ({
  saveQuery: saveQuery(store),
}))(React.memo(ToolbarSaveButton));

function ToolbarSaveButton({ isSaving, saveQuery, unsavedChanges }) {
  return (
    <IconButton tooltip="Save" onClick={() => saveQuery()} disabled={isSaving}>
      {unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
    </IconButton>
  );
}

ToolbarSaveButton.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  saveQuery: PropTypes.func.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
};

export default ConnectedToolbarSaveButton;
