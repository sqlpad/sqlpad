import CopyIcon from 'mdi-react/ContentCopyIcon';
import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import DatabaseIcon from 'mdi-react/DatabaseIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import NewIcon from 'mdi-react/PlusIcon';
import TagsIcon from 'mdi-react/TagMultipleIcon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import IconButton from '../../common/IconButton';
import Input from '../../common/Input';
import {
  formatQuery,
  handleCloneClick,
  resetNewQuery,
  runQuery,
  saveQuery,
  setQueryState
} from '../../stores/queries';
import { toggleSchema } from '../../stores/schema';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import QueryListButton from './QueryListButton';
import QueryTagsModal from './QueryTagsModal';
import ToolbarMenu from './ToolbarMenu';
import ToolbarSpacer from './ToolbarSpacer';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    queryId: state.query && state.query._id,
    queryName: state.query && state.query.name,
    showValidation: state.showValidation,
    unsavedChanges: state.unsavedChanges
  };
}

const ConnectedEditorNavBar = connect(mapStateToProps, store => ({
  toggleSchema,
  formatQuery,
  runQuery: runQuery(store),
  saveQuery: saveQuery(store),
  handleCloneClick,
  resetNewQuery,
  setQueryState
}))(React.memo(Toolbar));

function Toolbar({
  formatQuery,
  handleCloneClick,
  isRunning,
  isSaving,
  queryId,
  queryName,
  resetNewQuery,
  runQuery,
  saveQuery,
  setQueryState,
  showValidation,
  toggleSchema,
  unsavedChanges
}) {
  const [showTags, setShowTags] = useState(false);

  const error = showValidation && !queryName.length;
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

        <IconButton
          to="/queries/new"
          tooltip="New query"
          onClick={() => resetNewQuery()}
        >
          <NewIcon />
        </IconButton>

        <ToolbarSpacer grow />

        <IconButton tooltip="Toggle schema" onClick={toggleSchema}>
          <DatabaseIcon />
        </IconButton>

        <ConnectionDropDown />

        <ToolbarSpacer />

        <Input
          error={error}
          style={{ width: 260 }}
          placeholder="Query name"
          value={queryName}
          onChange={e => setQueryState('name', e.target.value)}
        />

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
  queryName: PropTypes.string.isRequired,
  queryId: PropTypes.string,
  showValidation: PropTypes.bool.isRequired,
  unsavedChanges: PropTypes.bool.isRequired
};

export default ConnectedEditorNavBar;
