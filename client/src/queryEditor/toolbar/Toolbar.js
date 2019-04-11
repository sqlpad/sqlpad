import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Drawer from 'antd/lib/drawer';
import Tooltip from 'antd/lib/tooltip';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ConnectionDropDown from '../ConnectionDropdown';
import QueriesTable from '../../queries/QueriesTable';
import AboutButton from './AboutButton';
import SignoutButton from './SignoutButton';
import ConfigButton from './ConfigButton';

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
)(React.memo(Toolbar));

function Toolbar({
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
  const cloneDisabled = !queryId;
  const [showQueries, setShowQueries] = useState(false);

  const isAdmin = currentUser.role === 'admin';

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
          <Tooltip placement="bottom" title="more">
            <Button onClick={handleMoreClick} icon="more" />
          </Tooltip>
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
          <AboutButton />
        </FormItem>

        {isAdmin && (
          <FormItem>
            <ConfigButton />
          </FormItem>
        )}

        <FormItem>
          <SignoutButton />
        </FormItem>
      </Form>
    </div>
  );
}

Toolbar.propTypes = {
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
