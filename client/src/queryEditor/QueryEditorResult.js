import { connect } from 'unistore/react';
import QueryResultDataTable from '../common/QueryResultDataTable.js';

const ConnectedQueryEditorResult = connect([
  'isRunning',
  'queryError',
  'queryResult'
])(QueryResultDataTable);

export default ConnectedQueryEditorResult;
