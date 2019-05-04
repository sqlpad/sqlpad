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
import Button from '../../common/Button';

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
    <div
      style={{
        width: '100%',
        backgroundColor: '#fafafa',
        padding: '.25rem .5rem',
        borderBottom: '1px solid #eee'
      }}
    >
      <Form style={{ display: 'flex' }} layout="inline">
        <QueryListButton />

        <Tooltip placement="bottom" title="New query">
          <IconButtonLink to="/queries/new" onClick={() => resetNewQuery()}>
            <Icon type="plus" />
          </IconButtonLink>
        </Tooltip>

        <Button onClick={toggleSchema}>schema</Button>
        <Button onClick={toggleVisSidebar}>Vis</Button>

        <ConnectionDropDown />

        <FormItem validateStatus={validationState}>
          <Input
            style={{ width: 260 }}
            placeholder="Query name"
            value={queryName}
            onChange={e => setQueryState('name', e.target.value)}
          />
        </FormItem>

        <Tooltip placement="bottom" title="Tags">
          <Button onClick={() => setShowDetails(true)} disabled={cloneDisabled}>
            <Icon type="tags" />
          </Button>
          <QueryDetailsModal
            visible={showDetails}
            onClose={() => setShowDetails(false)}
          />
        </Tooltip>

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
        <Button type="primary" onClick={() => runQuery()} disabled={isRunning}>
          Run
        </Button>

        <div style={{ flexGrow: 1 }} />

        <AboutButton />

        {isAdmin && <ConfigButton />}

        <SignoutButton />
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
