import { connect } from 'unistore/react';
import QueryResultDataTable from '../common/QueryResultContainer';

const ConnectedQueryEditorResult = connect([
  'isRunning',
  'queryError',
  'queryResult',
  // @ts-expect-error
])(QueryResultDataTable);

export default ConnectedQueryEditorResult;
