import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button';
import CopyIcon from 'mdi-react/ContentCopyIcon';
import UnsavedIcon from 'mdi-react/ContentSaveEditIcon';
import SaveIcon from 'mdi-react/ContentSaveIcon';
import DatabaseIcon from 'mdi-react/DatabaseIcon';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';
import FormatIcon from 'mdi-react/FormatAlignLeftIcon';
import NewIcon from 'mdi-react/PlusIcon';
import TagsIcon from 'mdi-react/TagMultipleIcon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import Drawer from '../../common/Drawer';
import IconButton from '../../common/IconButton';
import iconButtonStyles from '../../common/IconButton.module.css';
import Input from '../../common/Input';
import ConfigurationForm from '../../configuration/ConfigurationForm';
import ConnectionListDrawer from '../../connections/ConnectionListDrawer';
import { toggleSchema } from '../../stores/appNav';
import {
  formatQuery,
  handleCloneClick,
  resetNewQuery,
  runQuery,
  saveQuery,
  setQueryState
} from '../../stores/queries';
import UserList from '../../users/UserList';
import fetchJson from '../../utilities/fetch-json.js';
import ChartTypeSelect from '../ChartTypeSelect';
import ConnectionDropDown from '../ConnectionDropdown';
import AboutModal from './AboutModal';
import QueryListButton from './QueryListButton';
import QueryTagsModal from './QueryTagsModal';

const growSpacerStyle = { flexShrink: 0, flexGrow: 1, width: 8 };
const spacerStyle = { flexShrink: 0, width: 8 };

function Spacer({ grow }) {
  if (grow) {
    return <div style={growSpacerStyle} />;
  }
  return <div style={spacerStyle} />;
}

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
  store => ({
    toggleSchema,
    formatQuery,
    runQuery: runQuery(store),
    saveQuery: saveQuery(store),
    handleCloneClick,
    resetNewQuery,
    setQueryState
  })
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
  unsavedChanges
}) {
  const [showTags, setShowTags] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const error = showValidation && !queryName.length;
  const cloneDisabled = !queryId;

  const isAdmin = currentUser.role === 'admin';

  if (redirectToSignIn) {
    return <Redirect push to="/signin" />;
  }

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

        <Spacer grow />

        <IconButton tooltip="Toggle schema" onClick={toggleSchema}>
          <DatabaseIcon />
        </IconButton>

        <ConnectionDropDown />

        <Spacer />

        <Input
          error={error}
          style={{ width: 260 }}
          placeholder="Query name"
          value={queryName}
          onChange={e => setQueryState('name', e.target.value)}
        />

        <Spacer />

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

        <Spacer />

        <Button type="primary" onClick={() => runQuery()} disabled={isRunning}>
          Run
        </Button>

        <Spacer />

        <ChartTypeSelect style={{ width: 180 }} />

        <Spacer grow />

        <Menu>
          <MenuButton className={iconButtonStyles.btn}>
            <DotsVerticalIcon aria-hidden aria-label="menu" size={18} />
          </MenuButton>
          <MenuList>
            {isAdmin && (
              <MenuItem onSelect={() => setShowConfig(true)}>
                Configuration
              </MenuItem>
            )}
            {isAdmin && (
              <MenuItem onSelect={() => setShowConnections(true)}>
                Connections
              </MenuItem>
            )}
            {isAdmin && (
              <MenuItem onSelect={() => setShowUsers(true)}>Users</MenuItem>
            )}
            <div style={{ borderBottom: '1px solid #ddd' }} />
            <MenuItem onSelect={() => setShowAbout(true)}>About</MenuItem>
            <div style={{ borderBottom: '1px solid #ddd' }} />
            <MenuItem
              onSelect={async () => {
                await fetchJson('GET', '/api/signout');
                setRedirectToSignIn(true);
              }}
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>

        <Drawer
          title={'Configuration'}
          visible={showConfig}
          width={600}
          onClose={() => setShowConfig(false)}
          placement={'right'}
        >
          <ConfigurationForm onClose={() => setShowConfig(false)} />
        </Drawer>

        <Drawer
          title={'Users'}
          visible={showUsers}
          width={600}
          onClose={() => setShowUsers(false)}
          placement={'right'}
        >
          <UserList />
        </Drawer>

        <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

        <ConnectionListDrawer
          visible={showConnections}
          onClose={() => setShowConnections(false)}
        />
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
