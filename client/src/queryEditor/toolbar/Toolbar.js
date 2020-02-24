import CopyIcon from 'mdi-react/ContentCopyIcon';
import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import TagsIcon from 'mdi-react/TagMultipleIcon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import IconButton from '../../common/IconButton';
import {
  formatQuery,
  handleCloneClick,
  runQuery,
  saveQuery
} from '../../stores/queries';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import QueryListButton from './QueryListButton';
import QueryTagsModal from './QueryTagsModal';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarQueryNameInput from './ToolbarQueryNameInput';
import ToolbarSpacer from './ToolbarSpacer';
import ToolbarToggleSchemaButton from './ToolbarToggleSchemaButton';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    queryId: state.query && state.query._id,
    unsavedChanges: state.unsavedChanges
  };
}

const ConnectedEditorNavBar = connect(mapStateToProps, store => ({
  formatQuery,
  runQuery: runQuery(store),
  saveQuery: saveQuery(store),
  handleCloneClick
}))(React.memo(Toolbar));

function Toolbar({
  formatQuery,
  handleCloneClick,
  isRunning,
  isSaving,
  queryId,
  runQuery,
  saveQuery,

  unsavedChanges
}) {
  const [showTags, setShowTags] = useState(false);

  const cloneDisabled = !queryId;

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

        <IconButton tooltip="Tags" onClick={() => setShowTags(true)}>
          <TagsIcon />
        </IconButton>

        <QueryTagsModal visible={showTags} onClose={() => setShowTags(false)} />

        <IconButton
          tooltip="Clone"
          onClick={handleCloneClick}
          disabled={cloneDisabled}
        >
          <CopyIcon />
        </IconButton>

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
  handleCloneClick: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  formatQuery: PropTypes.func.isRequired,
  queryId: PropTypes.string,
  unsavedChanges: PropTypes.bool.isRequired
};

export default ConnectedEditorNavBar;
