import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import QueryResultDataTable from '../common/QueryResultDataTable.js';

const ConnectedQueryEditorResult = connect(
  ['isRunning', 'queryError', 'queryResult'],
  actions
)(QueryResultDataTable);

export default ConnectedQueryEditorResult;
