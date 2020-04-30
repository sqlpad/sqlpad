import React from 'react';
import ConnectionDropDown from '../ConnectionDropdown';
import ChartButton from './ChartButton';
import ToolbarCloneButton from './ToolbarCloneButton';
import ToolbarConnectionClientButton from './ToolbarConnectionClientButton';
import ToolbarFormatQueryButton from './ToolbarFormatQueryButton';
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
        borderBottom: '1px solid rgb(204, 204, 204)',
      }}
    >
      <div style={{ display: 'flex' }}>
        <ToolbarToggleSchemaButton />
        <ConnectionDropDown />
        <ToolbarSpacer />
        <ToolbarConnectionClientButton />

        <ToolbarSpacer grow />

        <ToolbarQueryNameInput />

        <ToolbarSpacer />

        <ToolbarTagsButton />
        <ToolbarCloneButton />
        <ToolbarFormatQueryButton />
        <ToolbarShareQueryButton />
        <ToolbarSaveButton />

        <ToolbarSpacer grow />

        <ToolbarSpacer />

        <ToolbarRunButton />

        <ToolbarSpacer />

        <ChartButton />
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
