import DatabaseIcon from 'mdi-react/DatabaseIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../../common/IconButton';
import { toggleSchema } from '../../stores/schema';

function mapStateToProps(state) {
  return {};
}

const ConnectedToolbarToggleSchemaButton = connect(mapStateToProps, store => ({
  toggleSchema
}))(React.memo(ToolbarToggleSchemaButton));

function ToolbarToggleSchemaButton({ toggleSchema }) {
  return (
    <IconButton tooltip="Toggle schema" onClick={toggleSchema}>
      <DatabaseIcon />
    </IconButton>
  );
}

export default ConnectedToolbarToggleSchemaButton;
