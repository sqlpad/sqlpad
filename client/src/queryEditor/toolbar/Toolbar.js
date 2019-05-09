import SaveIcon from 'mdi-react/ContentSaveIcon';
import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import TagsIcon from 'mdi-react/TagMultipleIcon';
import NewIcon from 'mdi-react/PlusBoxOutlineIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ConnectionDropDown from '../ConnectionDropdown';
import AboutButton from './AboutButton';
import SignoutButton from './SignoutButton';
import ConfigButton from './ConfigButton';
import QueryListButton from './QueryListButton';
import QueryDetailsModal from './QueryDetailsModal';
import ButtonLink from '../../common/ButtonLink';
import Button from '../../common/Button';
import Input from '../../common/Input';
import UsersButton from './UsersButton';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    queryId: state.query && state.query._id,
    queryName: state.query && state.query.name,
    showValidation: state.showValidation,
    unsavedChanges: state.unsavedChanges
  };
}

const ConnectedEditorNavBar = connect(
  mapStateToProps,
  actions
)(React.memo(Toolbar));

function Toolbar({
  currentUser,
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
  toggleVisSidebar,
  unsavedChanges
}) {
  const [showDetails, setShowDetails] = useState(false);

  const error = showValidation && !queryName.length;
  const cloneDisabled = !queryId;

  const isAdmin = currentUser.role === 'admin';

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#fafafa',
        padding: '.25rem .5rem',
        borderBottom: '1px solid #eee'
      }}
    >
      <div style={{ display: 'flex' }}>
        <QueryListButton />

        <ButtonLink
          to="/queries/new"
          tooltip="New query"
          icon={<NewIcon />}
          onClick={() => resetNewQuery()}
        />

        <Button onClick={toggleSchema}>schema</Button>
        <Button onClick={toggleVisSidebar}>Vis</Button>

        <ConnectionDropDown />

        <Input
          error={error}
          style={{ width: 260 }}
          placeholder="Query name"
          value={queryName}
          onChange={e => setQueryState('name', e.target.value)}
        />

        <Button
          tooltip="Tags"
          onClick={() => setShowDetails(true)}
          disabled={cloneDisabled}
          icon={<TagsIcon />}
        />

        <QueryDetailsModal
          visible={showDetails}
          onClose={() => setShowDetails(false)}
        />

        <Button
          tooltip="Clone"
          onClick={handleCloneClick}
          disabled={cloneDisabled}
          icon={<CopyIcon />}
        />

        <Button tooltip="Format" onClick={formatQuery} icon={<FormatIcon />} />

        <Button
          tooltip="Save"
          onClick={() => saveQuery()}
          disabled={isSaving}
          icon={unsavedChanges ? <UnsavedIcon /> : <SaveIcon />}
        />

        <Button type="primary" onClick={() => runQuery()} disabled={isRunning}>
          Run
        </Button>

        <div style={{ flexGrow: 1 }} />

        <AboutButton />

        {isAdmin && <ConfigButton />}
        {isAdmin && <UsersButton />}

        <SignoutButton />
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
