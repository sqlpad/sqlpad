import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
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
import IconButtonLink from '../../common/IconButtonLink';

const FormItem = Form.Item;

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

  const validationState = showValidation && !queryName.length ? 'error' : null;
  const cloneDisabled = !queryId;

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="w-100 bg-near-white ph2 pv1 bb b--light-gray">
      <Form className="flex" layout="inline">
        <FormItem>
          <QueryListButton />
        </FormItem>

        <FormItem>
          <Tooltip placement="bottom" title="New query">
            <IconButtonLink to="/queries/new" onClick={() => resetNewQuery()}>
              <Icon type="plus" />
            </IconButtonLink>
          </Tooltip>
        </FormItem>

        <FormItem>
          <Button.Group>
            <Button icon="database" onClick={toggleSchema} />
            <Button icon="bar-chart" onClick={toggleVisSidebar} />
          </Button.Group>
        </FormItem>

        <FormItem>
          <ConnectionDropDown />
        </FormItem>

        <FormItem validateStatus={validationState}>
          <Input
            className="w5"
            placeholder="Query name"
            value={queryName}
            onChange={e => setQueryState('name', e.target.value)}
            addonAfter={
              <Tooltip placement="bottom" title="Tags">
                <Icon onClick={() => setShowDetails(true)} type="tags" />
                <QueryDetailsModal
                  visible={showDetails}
                  onClose={() => setShowDetails(false)}
                />
              </Tooltip>
            }
          />
        </FormItem>

        <FormItem>
          <Button.Group>
            <Tooltip placement="bottom" title="Clone">
              <Button onClick={handleCloneClick} disabled={cloneDisabled}>
                <Icon type="copy" />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Format">
              <Button onClick={formatQuery}>
                <Icon type="align-left" />
              </Button>
            </Tooltip>

            <Tooltip placement="bottom" title="Save">
              <Button onClick={() => saveQuery()} disabled={isSaving}>
                <Badge dot={unsavedChanges}>
                  <Icon type="save" />
                </Badge>
              </Button>
            </Tooltip>
            <Button
              type="primary"
              onClick={() => runQuery()}
              disabled={isRunning}
            >
              Run
            </Button>
          </Button.Group>
        </FormItem>

        <div className="flex-grow-1" />

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
  saveQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  formatQuery: PropTypes.func.isRequired,
  queryName: PropTypes.string.isRequired,
  queryId: PropTypes.string,
  showValidation: PropTypes.bool.isRequired,
  unsavedChanges: PropTypes.bool.isRequired
};

export default ConnectedEditorNavBar;
