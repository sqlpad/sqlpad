import { connect } from 'unistore/react';
import QueryResultDataTable from '../common/QueryResultContainer.tsx';

const ConnectedQueryEditorResult = connect([
  'isRunning',
  'queryError',
  'queryResult',
])(QueryResultDataTable);

export default ConnectedQueryEditorResult;
