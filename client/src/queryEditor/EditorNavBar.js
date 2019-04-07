import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Radio from 'antd/lib/radio';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import PropTypes from 'prop-types';
import React from 'react';
import ConnectionDropDown from './ConnectionDropdown';

const FormItem = Form.Item;

function mapStateToProps(state) {
  return {
    activeTabKey: state.activeTabKey,
    isRunning: state.isRunning,
    isSaving: state.isSaving,
    showValidation: state.showValidation,
    unsavedChanges: state.unsavedChanges,
    queryName: state.query && state.query.name,
    queryId: state.query && state.query._id
  };
}

const ConnectedEditorNavBar = connect(
  mapStateToProps,
  actions
)(React.memo(EditorNavBar));

function EditorNavBar({
  activeTabKey,
  isSaving,
  isRunning,
  handleCloneClick,
  formatQuery,
  queryName,
  queryId,
  showValidation,
  unsavedChanges,
  setQueryState,
  handleTabSelect,
  saveQuery,
  runQuery,
  handleMoreClick
}) {
  const validationState = showValidation && !queryName.length ? 'error' : null;
  const saveText = unsavedChanges ? 'Save*' : 'Save';
  const cloneDisabled = !queryId;

  return (
    <div className="w-100 bg-near-white ph2 pv1 bb b--light-gray">
      <Form layout="inline">
        <FormItem>
          <ConnectionDropDown />
        </FormItem>
        <FormItem>
          <Radio.Group value={activeTabKey} onChange={handleTabSelect}>
            <Radio.Button value="sql">
              <Icon type="code-o" /> SQL
            </Radio.Button>
            <Radio.Button value="vis">
              <Icon type="bar-chart" /> Vis
            </Radio.Button>
          </Radio.Group>
        </FormItem>
        <FormItem>
          <Button.Group>
            <Button onClick={handleCloneClick} disabled={cloneDisabled}>
              Clone
            </Button>
            <Button onClick={formatQuery}>Format</Button>
            <Button
              style={{ minWidth: 75 }}
              onClick={() => saveQuery()}
              disabled={isSaving}
            >
              {saveText}
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
        <FormItem validateStatus={validationState}>
          <Input
            className="w5"
            placeholder="Query name"
            value={queryName}
            onChange={e => setQueryState('name', e.target.value)}
          />
        </FormItem>
        <FormItem>
          <Button onClick={handleMoreClick}>&hellip;</Button>
        </FormItem>
      </Form>
    </div>
  );
}

EditorNavBar.propTypes = {
  activeTabKey: PropTypes.string.isRequired,
  handleTabSelect: PropTypes.func.isRequired,
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
