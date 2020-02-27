import React from 'react';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import QueryListButton from './QueryListButton';
import ToolbarCloneButton from './ToolbarCloneButton';
import ToolbarFormatQueryButton from './ToolbarFormatQueryButton';
import ToolbarMenu from './ToolbarMenu';
import ToolbarNewQueryButton from './ToolbarNewQueryButton';
import ToolbarQueryNameInput from './ToolbarQueryNameInput';
import ToolbarRunButton from './ToolbarRunButton';
import ToolbarSaveButton from './ToolbarSaveButton';
import ToolbarShareQueryButton from './ToolbarShareQueryButton';
import ToolbarSpacer from './ToolbarSpacer';
import ToolbarTagsButton from './ToolbarTagsButton';
import ToolbarToggleSchemaButton from './ToolbarToggleSchemaButton';

function Toolbar() {
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
        <ToolbarShareQueryButton />
        <ToolbarSaveButton />

        <ToolbarSpacer />

        <ToolbarRunButton />

        <ToolbarSpacer />

        <ChartButton />

        <ToolbarSpacer grow />

        <ToolbarMenu />
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
