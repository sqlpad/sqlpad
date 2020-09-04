import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { saveQuery } from '../../stores/queries';

function mapStateToProps(state: any) {
  return {
    isSaving: state.isSaving,
    unsavedChanges: state.unsavedChanges,
  };
}

const ConnectedToolbarSaveButton = connect(mapStateToProps, (store) => ({
  saveQuery: saveQuery(store),
  // @ts-expect-error ts-migrate(2345) FIXME: Property 'saveQuery' is missing in type '{ isSavin... Remove this comment to see the full error message
}))(React.memo(ToolbarSaveButton));

type Props = {
  isSaving: boolean;
  saveQuery: (...args: any[]) => any;
  unsavedChanges: boolean;
};

function ToolbarSaveButton({ isSaving, saveQuery, unsavedChanges }: Props) {
  return (
    <IconButton tooltip="Save" onClick={() => saveQuery()} disabled={isSaving}>
      {unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
    </IconButton>
  );
}

export default ConnectedToolbarSaveButton;
