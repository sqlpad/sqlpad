import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Drawer from 'antd/lib/drawer';
import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import AboutContent from '../AboutContent';
import ConnectionDropDown from './ConnectionDropdown';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';
import QueriesTable from '../queries/QueriesTable';
import ConfigurationDrawer from '../configuration/ConfigurationDrawer';
import UsersDrawer from '../users/UserDrawer';
import fetchJson from '../utilities/fetch-json.js';

const FormItem = Form.Item;

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    queryId: state.query && state.query._id,
    queryName: state.query && state.query.name,
    showValidation: state.showValidation,
    unsavedChanges: state.unsavedChanges,
    version: state.version
  };
}

const ConnectedEditorNavBar = connect(
  mapStateToProps,
  actions
)(React.memo(EditorNavBar));

function EditorNavBar({
  currentUser,
  formatQuery,
  handleCloneClick,
  handleMoreClick,
  isRunning,
  isSaving,
  queryId,
  queryName,
  resetNewQuery,
  runQuery,
  saveQuery,
  setQueryState,
  showValidation,
  toggleQueriesSidebar,
  toggleSchema,
  toggleVisSidebar,
  unsavedChanges,
  version
}) {
  const validationState = showValidation && !queryName.length ? 'error' : null;
  const saveText = unsavedChanges ? 'Save*' : 'Save';
  const cloneDisabled = !queryId;
  const [redirect, setRedirect] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showQueries, setShowQueries] = useState(false);

  const handleConfigClose = useCallback(() => setShowConfig(false), []);
  const handleUsersClose = useCallback(() => setShowUsers(false), []);

  const isAdmin = currentUser.role === 'admin';

  if (redirect) {
    return <Redirect push to="/signin" />;
  }

  return (
    <div className="w-100 bg-near-white ph2 pv1 bb b--light-gray">
      <Form className="flex" layout="inline">
        <FormItem>
          <Button.Group>
            <Button icon="file-text" onClick={toggleQueriesSidebar} />
            <Button icon="database" onClick={toggleSchema} />
            <Button icon="bar-chart" onClick={toggleVisSidebar} />
          </Button.Group>
        </FormItem>

        <FormItem>
          <ConnectionDropDown />
        </FormItem>

        {isAdmin && (
          <FormItem>
            <Tooltip placement="bottom" title="DB connections">
              <Button icon="api" onClick={() => setShowConnections(true)} />
            </Tooltip>

            <ConnectionListDrawer
              visible={showConnections}
              onClose={() => setShowConnections(false)}
            />
          </FormItem>
        )}

        <FormItem>
          <Button icon="file-text" onClick={() => setShowQueries(true)} />
          <Drawer
            title={'Queries'}
            visible={showQueries}
            height="90%"
            destroyOnClose={true}
            onClose={() => setShowQueries(false)}
            placement="bottom"
            bodyStyle={{
              backgroundColor: '#f0f2f5',
              height: 'calc(90vh - 55px)',
              overflow: 'auto'
            }}
          >
            <QueriesTable />
          </Drawer>
        </FormItem>

        <FormItem validateStatus={validationState}>
          <Input
            className="w5"
            placeholder="Query name"
            value={queryName}
            onChange={e => setQueryState('name', e.target.value)}
          />
        </FormItem>

        <FormItem>
          <Button onClick={handleMoreClick} icon="more" />
        </FormItem>

        <div className="flex-grow-1" />

        <FormItem>
          <Button.Group>
            <Button onClick={handleCloneClick} disabled={cloneDisabled}>
              Clone
            </Button>
            <Button onClick={formatQuery}>Format</Button>

            <Route
              render={({ history }) => (
                <Button
                  icon="plus"
                  onClick={() => {
                    history.push('/queries/new');
                    resetNewQuery();
                  }}
                />
              )}
            />

            <Button onClick={() => saveQuery()} disabled={isSaving}>
              <Badge dot={unsavedChanges}>
                <Icon type="save" />
              </Badge>
            </Button>
            <Button
              type="primary"
              onClick={() => runQuery()}
              disabled={isRunning}
            >
              Run
            </Button>
          </Button.Group>
        </FormItem>

        <FormItem>
          <Tooltip placement="bottom" title="About">
            <Button
              onClick={() => {
                Modal.info({
                  width: 650,
                  title: 'About SQLPad',
                  maskClosable: true,
                  content: (
                    <AboutContent version={version && version.current} />
                  ),
                  onOk() {}
                });
              }}
              icon="question-circle-o"
            />
          </Tooltip>
        </FormItem>

        {version && version.updateAvailable && (
          <FormItem>
            <Tooltip placement="bottom" title="Update available">
              <Button
                onClick={() => {
                  Modal.info({
                    title: 'Update Available (' + version.updateType + ')',
                    maskClosable: true,
                    content: (
                      <div>
                        Installed Version: {version.current}
                        <br />
                        Latest: {version.latest}
                      </div>
                    ),
                    onOk() {}
                  });
                }}
                icon="exclamation-circle-o"
              />
            </Tooltip>
          </FormItem>
        )}

        {isAdmin && (
          <FormItem>
            <Tooltip placement="bottom" title="Configuration">
              <Button icon="setting" onClick={() => setShowConfig(true)} />
            </Tooltip>
            <ConfigurationDrawer
              visible={showConfig}
              onClose={handleConfigClose}
            />
          </FormItem>
        )}

        {isAdmin && (
          <FormItem>
            <Tooltip placement="bottom" title="Users">
              <Button icon="team" onClick={() => setShowUsers(true)} />
            </Tooltip>
            <UsersDrawer visible={showUsers} onClose={handleUsersClose} />
          </FormItem>
        )}

        <FormItem>
          <Tooltip placement="bottom" title="Sign out">
            <Button
              onClick={async () => {
                await fetchJson('GET', '/api/signout');
                setRedirect(true);
              }}
              icon="logout"
            />
          </Tooltip>
        </FormItem>
      </Form>
    </div>
  );
}

EditorNavBar.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  handleCloneClick: PropTypes.func.isRequired,
  handleMoreClick: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  formatQuery: PropTypes.func.isRequired,
  queryName: PropTypes.string.isRequired,
  queryId: PropTypes.string,
  showValidation: PropTypes.bool.isRequired,
  unsavedChanges: PropTypes.bool.isRequired
};

export default ConnectedEditorNavBar;
