import React from 'react';
import ConnectionDropDown from './ConnectionDropdown';
import ToolbarChartButton from './ToolbarChartButton';
import ToolbarConnectionClientButton from './ToolbarConnectionClientButton';
import ToolbarQueryName from './ToolbarQueryName';
import ToolbarRunButton from './ToolbarRunButton';
import ToolbarSpacer from './ToolbarSpacer';
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
        <ToolbarQueryName />
        <ToolbarSpacer grow />
        <ToolbarRunButton />
        <ToolbarSpacer />
        <ToolbarChartButton />
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
