import React from 'react';
import {
  useSessionIsRunning,
  useSessionQueryError,
  useStatementColumns,
  useStatementRowCount,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';
import ErrorBlock from './ErrorBlock';
import InfoBlock from './InfoBlock';
import QueryResultDataTable from './QueryResultDataTable';
import QueryResultRunning from './QueryResultRunning';

export interface Props {
  statementId?: string;
}

function QueryResultContainer({ statementId }: Props) {
  const columns = useStatementColumns(statementId) || [];
  const { data, error } = api.useStatementResults(statementId);
  const rowCount = useStatementRowCount(statementId);
  const status = useStatementStatus(statementId);
  const isRunning = useSessionIsRunning();
  const queryError = useSessionQueryError();

  if (isRunning || (status === 'finished' && !data)) {
    return <QueryResultRunning />;
  }
  if (queryError) {
    return <ErrorBlock>{queryError}</ErrorBlock>;
  }
  if (error) {
    return <ErrorBlock>Error getting query results</ErrorBlock>;
  }
  if (rowCount === undefined) {
    return null;
  }
  if (status === 'finished' && rowCount === 0) {
    return (
      <InfoBlock>
        Query finished
        <br />
        No rows returned
      </InfoBlock>
    );
  }
  return <QueryResultDataTable columns={columns} rows={data} />;
}

export default QueryResultContainer;
