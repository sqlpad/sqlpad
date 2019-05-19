import React, { useCallback } from 'react';
import { connect } from 'unistore/react';
import { setQueryState, handleQuerySelectionChange } from '../stores/queries';
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
  const onChange = useCallback(value => setQueryState('queryText', value), [
    setQueryState
  ]);

  return (
    <div style={{ padding: 4, height: '100%', width: '100%' }}>
      <SqlEditor
        value={value}
        onChange={onChange}
        onSelectionChange={handleQuerySelectionChange}
      />
    </div>
  );
}

const ConnectedQueryEditorSqlEditor = connect(
  mapStateToProps,
  { setQueryState, handleQuerySelectionChange }
)(QueryEditorSqlEditor);

export default ConnectedQueryEditorSqlEditor;
