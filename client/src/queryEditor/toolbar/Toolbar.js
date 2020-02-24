import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import { runQuery } from '../../stores/queries';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import QueryListButton from './QueryListButton';
import ToolbarCloneButton from './ToolbarCloneButton';
import ToolbarFormatQueryButton from './ToolbarFormatQueryButton';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarQueryNameInput from './ToolbarQueryNameInput';
import ToolbarSaveButton from './ToolbarSaveButton';
import ToolbarSpacer from './ToolbarSpacer';
import ToolbarTagsButton from './ToolbarTagsButton';
import ToolbarToggleSchemaButton from './ToolbarToggleSchemaButton';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning
  };
}

const ConnectedEditorNavBar = connect(mapStateToProps, store => ({
  runQuery: runQuery(store)
}))(React.memo(Toolbar));

function Toolbar({ isRunning, runQuery }) {
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
        <ToolbarFormatQueryButton />
        <ToolbarSaveButton />

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
  isRunning: PropTypes.bool.isRequired,
  runQuery: PropTypes.func.isRequired
};

export default ConnectedEditorNavBar;
