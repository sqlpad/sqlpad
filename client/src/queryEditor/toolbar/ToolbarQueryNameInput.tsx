import React from 'react';
import { connect } from 'unistore/react';
import Input from '../../common/Input';
import { setQueryState } from '../../stores/queries';

function mapStateToProps(state: any) {
  return {
    queryName: state.query && state.query.name,
    showValidation: state.showValidation,
  };
}

const ConnectedToolbarQueryNameInput = connect(mapStateToProps, (store) => ({
  setQueryState,
}))(React.memo(ToolbarQueryNameInput));

function ToolbarQueryNameInput({
  queryName,
  setQueryState,
  showValidation,
}: any) {
  const error = showValidation && !queryName.length;

  return (
    <Input
      error={error}
      style={{ width: 260 }}
      placeholder="Query name"
      value={queryName}
      onChange={(e: any) => setQueryState('name', e.target.value)}
    />
  );
}

export default ConnectedToolbarQueryNameInput;
