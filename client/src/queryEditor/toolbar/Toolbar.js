import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import IconButton from '../../common/IconButton';
import { formatQuery, runQuery, saveQuery } from '../../stores/queries';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import QueryListButton from './QueryListButton';
import ToolbarCloneButton from './ToolbarCloneButton';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarQueryNameInput from './ToolbarQueryNameInput';
import ToolbarSpacer from './ToolbarSpacer';
import ToolbarTagsButton from './ToolbarTagsButton';
import ToolbarToggleSchemaButton from './ToolbarToggleSchemaButton';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    unsavedChanges: state.unsavedChanges
  };
}

const ConnectedEditorNavBar = connect(mapStateToProps, store => ({
  formatQuery,
  runQuery: runQuery(store),
  saveQuery: saveQuery(store)
}))(React.memo(Toolbar));

function Toolbar({
  formatQuery,
  isRunning,
  isSaving,
  runQuery,
  saveQuery,
  unsavedChanges
}) {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        padding: 6,
        borderBottom: '1px solid rgb(204, 204, 204)'
      }}
    >
      <div style={{ display: 'flex' }}>
        <QueryListButton />
        <ToolbarNewQueryButton />

        <ToolbarSpacer grow />

        <ToolbarToggleSchemaButton />
        <ConnectionDropDown />

        <ToolbarSpacer />

        <ToolbarQueryNameInput />

        <ToolbarSpacer />

        <ToolbarTagsButton />
        <ToolbarCloneButton />

        <IconButton tooltip="Format" onClick={formatQuery}>
          <FormatIcon />
        </IconButton>

        <IconButton
          tooltip="Save"
          onClick={() => saveQuery()}
          disabled={isSaving}
        >
          {unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
        </IconButton>

        <ToolbarSpacer />

        <Button type="primary" onClick={() => runQuery()} disabled={isRunning}>
          Run
        </Button>

        <ToolbarSpacer />

        <ChartButton />

        <ToolbarSpacer grow />

        <ToolbarMenu />
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  saveQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  formatQuery: PropTypes.func.isRequired,
  unsavedChanges: PropTypes.bool.isRequired
};

export default ConnectedEditorNavBar;
