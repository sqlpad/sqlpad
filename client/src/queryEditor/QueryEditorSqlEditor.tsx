import React, { useCallback } from 'react';
import { connect } from 'unistore/react';
import SqlEditor from '../common/SqlEditor';
import { handleQuerySelectionChange, setQueryState } from '../stores/queries';

function mapStateToProps(state: any, props: any) {
  return {
    value: state.query && state.query.queryText,
  };
}

function QueryEditorSqlEditor({
  value,
  setQueryState,
  handleQuerySelectionChange,
}: any) {
  const onChange = useCallback((value) => setQueryState('queryText', value), [
    setQueryState,
  ]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <SqlEditor
        value={value || ''}
        // @ts-expect-error
        onChange={onChange}
        onSelectionChange={handleQuerySelectionChange}
      />
    </div>
  );
}

const ConnectedQueryEditorSqlEditor = connect(mapStateToProps, {
  setQueryState,
  handleQuerySelectionChange,
})(QueryEditorSqlEditor);

export default ConnectedQueryEditorSqlEditor;
