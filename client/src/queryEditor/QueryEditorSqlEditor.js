import React, { useCallback } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import SqlEditor from '../common/SqlEditor';

function mapStateToProps(state, props) {
  return {
    value: state.query && state.query.queryText
  };
}

function QueryEditorSqlEditor({
  value,
  setQueryState,
  handleQuerySelectionChange
}) {
  const onChange = useCallback(value => setQueryState('queryText', value), []);

  return (
    <SqlEditor
      value={value}
      onChange={onChange}
      onSelectionChange={handleQuerySelectionChange}
    />
  );
}

const ConnectedQueryEditorSqlEditor = connect(
  mapStateToProps,
  actions
)(QueryEditorSqlEditor);

export default ConnectedQueryEditorSqlEditor;
